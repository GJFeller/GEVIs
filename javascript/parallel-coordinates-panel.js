class ParallelCoordinatesPlot extends AbstractPanelBuilder {
    constructor(data, id, window) {
        super();
        this.id = id;
        this.data = data;
        this.varList = [];
        this.window = window;
        this.brush = d3.svg.brush();
        this.query = null;
        this.isLogScale = false;
    }

    appendToPanel(panel, id) {
        this.panel = panel;
        panel.append("<svg id=" + id + "-parallel width=\"100%\" height=\"100%\"></svg>");
        this.id = id;
        this.render();
    }

    setIfLogScale(isLogScale) {
        this.isLogScale = isLogScale;
        this.render();
    }

    isLogScale() {
        return this.isLogScale;
    }

    setEnsemble(ensembleInfo) {
        this.ensembleInfo = ensembleInfo;
    }

    setQuery(query) {
        this.query = query;
        this.getRemoteData();
    }

    getRemoteData() {
        $('#loading').css('visibility','visible');
        var $this = this;
        if(this.data instanceof Array)
            this.data.splice(0,this.data.length);

        var varNameList = [];
        this.varList.forEach(function (variable, idx) {
            varNameList[idx] = variable.variable + "-" + variable.specie;
        });
        var ensembleId = selectedEnsembles[0]._id;
        var simulationList = [];
        // FIXME: Implement the query system to solve this problem with selectedSimulations
        simulationList = this.ensembleInfo.simulations;
        /*if(selectedSimulations.length === 0) {
            //simulationList = selectVariablesPanel.getEnsembleList()[0].simulations;
            simulationList = selectedEnsembles[0].simulations;
        }
        else {
            simulationList = selectedSimulations;
        }*/
        var promises = [];
        for(var i = 0; i < simulationList.length; i++) {
            var variableStringList = this.varList[0].id;
            for(var j = 1; j < this.varList.length; j++) {
                variableStringList = variableStringList + "," + this.varList[j].id;
            }
            if(this.query !== null && this.query.selectedCells.length > 0) {
                for(var j = 0; j < this.query.selectedCells.length; j++) {
                    promises.push(backendConnection.getMultivariateData(this.query.selectedCells[j], 0, 0, this.query.selectedTime, simulationList[i], variableStringList));
                }
            }
            else {
                promises.push(backendConnection.getMultivariateData(0, 0, 0, 0, simulationList[i], variableStringList));
            }
        }
        Promise.all(promises)
            .then(function(values) {
                
                var dataList = [];
                values.forEach(function (elem) {
                    if(elem.length > 0)
                    {
                        var data = {};
                        data.simulationId = elem[0].simulationId;
                        data.time = elem[0].time;
                        $this.varList.forEach(function (variable, idx) {
                            for(var i = 0; i < elem[0].variables.length; i++) {
                                if(variable.id == elem[0].variables[i].variableId) {
                                    data[varNameList[idx]] = elem[0].variables[i].value;
                                }
                            }
                        });
                        dataList.push(data);
                    }
                });
                $this.data = $this.reformatDataList(dataList);
                $this.render();
                $('#loading').css('visibility','hidden');
            });
    }

    reformatDataList(dataList) {
        var simulationList = this.ensembleInfo.simulations;
        var finalData = [];
        if(dataList.length > 0) {
            simulationList.forEach(function (simulation) {
                var simArray = dataList.filter(function (a) { return a.simulationId === simulation; });
                var simAverage = simArray.reduce((a, b, index, self) => {
                    var keys = Object.keys(a);
                    var c = {};

                    keys.map((key) => {
                        if(key === "simulationId" || key === "time") {
                            c[key] = a[key];
                        }
                        else {
                            c[key] = a[key] + b[key];
                            if(index + 1 === self.length) {
                                c[key] = c[key] / self.length;
                            }                        
                        }
                    });
                    return c;
                });
                //console.log(simAverage);
                finalData.push(simAverage);
            });
        }
        console.log(finalData);
        return finalData;
    }

    setVariableList(varList) {
        this.varList = varList;
        this.getRemoteData();
    }

    getVariableList() {
        return this.varList;
    }

    render() {
        if(this.panel !== undefined) {
            var $this = this;
            var margin = {top: 30, right: 10, bottom: 10, left: 10};
            var width = this.panel.width() - margin.left - margin.right;
            var height = this.panel.height() - margin.top - margin.bottom;

            var x = d3.scale.ordinal().rangePoints([0, width], 1),
                y = {},
                dragging = {};

            var formatSiPrefix = d3.format("3e");

            var line = d3.svg.line(),
                axis = d3.svg.axis().orient("left").tickFormat(formatSiPrefix),
                background,
                foreground;

            var domainByVariable = {},
                variables = [],
                numberVariables = 0;

            var div = d3.select("#"+this.id+"-parallel");

            div.selectAll('*').remove();
            if(this.data.length > 0) {
                domainByVariable = {};
                variables = d3.keys(this.data[0]).filter(function (d) { return d !== "simulationId" && d !== "time" });
                numberVariables = variables.length;
                
                

                x.domain(variables);

                // Get Min and Max of each of the columns
                variables.forEach(function(variable) {
                    domainByVariable[variable] = d3.extent($this.data, function(d) {
                        return d[variable];
                    });
                    if(!$this.isLogScale) {
                        y[variable] = d3.scale.linear()
                            .domain(domainByVariable[variable])
                            .range([height, 0]);
                    }
                    else {
                        y[variable] = d3.scale.pow().exponent(1 / 10)
                            .domain(domainByVariable[variable])
                            .range([height, 0]);
                    }
                });

                console.log(domainByVariable);
                console.log($this.data);

                var svg = div.append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                
                // Add grey background lines for context.
                background = svg.append("g")
                    .attr("class", "backgroundPCP")
                .selectAll("path")
                    .data($this.data)
                .enter().append("path")
                    .attr("d", path);
                
                // Add blue foreground lines for focus.
                foreground = svg.append("g")
                    .attr("class", "foregroundPCP")
                .selectAll("path")
                    .data($this.data)
                .enter().append("path")
                    .attr("d", path)
                    .attr("simulationId", function(d) { return d.simulationId; });

                // Add a group element for each dimension.
                var g = svg.selectAll(".dimension")
                    .data(variables)
                .enter().append("g")
                    .attr("class", "dimension")
                    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
                    .call(d3.behavior.drag()
                        .origin(function(d) { return {x: x(d)}; })
                        .on("dragstart", function(d) {
                            dragging[d] = x(d);
                            background.attr("visibility", "hidden");
                        })
                        .on("drag", function(d) {
                            dragging[d] = Math.min(width, Math.max(0, d3.event.x));
                            foreground.attr("d", path);
                            variables.sort(function(a, b) { return position(a) - position(b); });
                            x.domain(variables);
                            g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
                        })
                        .on("dragend", function(d) {
                            delete dragging[d];
                            transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                            transition(foreground).attr("d", path);
                            console.log(d);
                            background
                                .attr("d", path)
                                .transition()
                                .delay(500)
                                .duration(0)
                            .attr("visibility", null);
                    }));
                
                // Add an axis and title.
                g.append("g")
                    .attr("class", "axisPCP")
                    .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
                .append("text")
                    .style("text-anchor", "middle")
                    .attr("y", -9)
                    .attr("transform", "rotate(-7)")
                    .text(function(d) { return d; });

                // Add and store a brush for each axis.
                g.append("g")
                    .attr("class", "brushPCP")
                    .each(function(d) {
                        d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush).on("brushend", brushend));
                    })
                    .selectAll("rect")
                    .attr("x", -8)
                    .attr("width", 16);
            }

            function position(d) {
                var v = dragging[d];
                return v == null ? x(d) : v;
            }
            
            function transition(g) {
                return g.transition().duration(500);
            }
            
            // Returns the path for a given data point.
            function path(d) {
                return line(variables.map(function(p) { return [position(p), y[p](d[p])]; }));
            }
            
            function brushstart() {
                d3.event.sourceEvent.stopPropagation();
            }
            
            // Handles a brush event, toggling the display of foreground lines.
            function brush() {
                var actives = variables.filter(function(p) { return !y[p].brush.empty(); }),
                    extents = actives.map(function(p) { return y[p].brush.extent(); });
                foreground.style("display", function(d) {
                return actives.every(function(p, i) {
                    return extents[i][0] <= d[p] && d[p] <= extents[i][1];
                }) ? null : "none";
                });
            }

            function brushend() {
                var selectedSimulations = [];
                foreground.each(function (d) {
                    if(this.style.display !== "none") {
                        if(selectedSimulations.indexOf(d.simulationId) < 0) {
                            selectedSimulations.push(d.simulationId);
                        }
                    }
                });
                changedSimulationSelectionEvent.selectedSimulations = selectedSimulations;
                changedSimulationSelectionEvent.ensemble = $this.ensembleInfo;
                document.dispatchEvent(changedSimulationSelectionEvent);
            }
        }
    }

    resizePanel(width, height) {
        this.render();
    }

    setWindow(window) {
        this.window = window;
    }
}