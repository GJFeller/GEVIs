class TemporalVisPanel extends AbstractPanelBuilder {
    constructor(data, id) {
        super();
        this.id = id;
        this.data = data;
        this.varList = [];
    }

    appendToPanel(panel, id) {
        this.panel = panel;
        panel.append("<div id=" + id + "-temporal width=\"100%\" height=\"100%\"></svg>");
        this.id = id;
        this.render();
    }

    getRemoteData() {
        var $this = this;
        if(this.data instanceof Array)
            this.data.splice(0,this.data.length);
        
        var varNameList = [];
        this.varList.forEach(function (variable, idx) {
            varNameList[idx] = variable.variable + "-" + variable.specie;
        });
        console.log(selectVariablesPanel.getEnsembleList()[0]);
        var ensembleId = selectVariablesPanel.getEnsembleList()[0]._id;
        var simulationList = selectVariablesPanel.getEnsembleList()[0].simulations;
        var promises = [];
        for(var i = 0; i < simulationList.length; i++) {
            var variableStringList = this.varList[0].id;
            for(var j = 1; j < this.varList.length; j++) {
                variableStringList = variableStringList + "," + this.varList[j].id;
            }
            promises.push(backendConnection.getTemporalData(0, 0, 0, simulationList[i], variableStringList, ensembleId));
        }
        Promise.all(promises)
            .then(function(values) {
                var dataList = [];
                values.forEach(function (elem) {
                    if(elem.length > 0)
                    {
                        //console.log(elem);
                        elem.forEach(function (aRow) {
                            var data = {};
                            data.simulationId = aRow.simulationId;
                            data.time = aRow.time;
                            $this.varList.forEach(function (variable, idx) {
                                for(var i = 0; i < aRow.variables.length; i++) {
                                    if(variable.id == aRow.variables[i].variableId) {
                                        data[varNameList[idx]] = aRow.variables[i].value;
                                    }
                                }
                            });
                            //console.log(data);
                            dataList.push(data);
                        });
                        //var data = {};
                        /*data.simulationId = elem[0].simulationId;
                        data.time = elem[0].time;
                        $this.varList.forEach(function (variable, idx) {
                            for(var i = 0; i < elem[0].variables.length; i++) {
                                if(variable.id == elem[0].variables[i].variableId) {
                                    data[varNameList[idx]] = elem[0].variables[i].value;
                                }
                            }
                        });
                        dataList.push(data);
                        console.log(data);*/
                    }
                });
                $this.data = $this.reformatDataList(dataList);
                $this.render();
            })
            .catch(function () {
               //console.log("Erro ao recuperar dados"); 
            });
        
    }

    setVariableList(varList) {
        this.varList = varList;
        this.getRemoteData();
    }

    reformatDataList(dataList) {
        //console.log(this.varList);
        var varStringList = [];
        this.varList.forEach(function (variable) {
            varStringList.push(variable.variable + "-" + variable.specie);
        });
        var simulationList = selectVariablesPanel.getEnsembleList()[0].simulations;
        //Set initial data
        var chartMap = new Map();
        varStringList.forEach(function (variable) {
            chartMap.set(variable, new Map());
            simulationList.forEach(function (simulation) {
                var simulationData = chartMap.get(variable);
                simulationData.set(simulation, []);
            });
        });
        
        // Set the whole data
        dataList.forEach(function (data) {
            var simulationId = data.simulationId;
            var time = data.time;
            varStringList.forEach(function (variable) {
                chartMap.get(variable).get(simulationId).push({time: time, value: data[variable]});
            });
        });
        //console.log(chartMap);

        varStringList.forEach(function (variable) {
            simulationList.forEach(function (simulation) {
                chartMap.get(variable).get(simulation).sort(function (a, b) {
                    return (a.time > b.time) ? 1 : ((b.time > a.time) ? -1 : 0);
                });

            });
        });
        console.log(chartMap);
        return chartMap;
    }

    render() {

        var margin = {top: 20, right: 80, bottom: 30, left: 50};
        var $this = this;
        var width = this.panel.width() - margin.left - margin.right;
        var height = this.panel.height();

        var formatSiPrefix = d3.format("3e");
        //var heightEachPlot = height - margin.top - margin.bottom;

        console.log($this.data);
        var xDomain = [],
            yDomainByVariable = {},
            variablesIterable = $this.data.keys(),
            variables = [],
            numberVariables = $this.data.size;

        console.log(numberVariables);
        if(numberVariables > 0) {
            var minX = 9000000;
            var maxX = -900000;
            // Get Min and Max of each variable
            for(let variable of variablesIterable) {
                variables.push(variable);
            //variables.forEach(function(variable) {
                var minVar = 9000000;
                var maxVar = -900000;
                var varData = $this.data.get(variable);
                var simulationList = selectVariablesPanel.getEnsembleList()[0].simulations;
                simulationList.forEach(function(simulation) {
                    var simData = varData.get(simulation);
                    var timeExtent = d3.extent(simData, function(d) {
                        return d.time;
                    });
                    var varExtent = d3.extent(simData, function(d) {
                        return d.value;
                    });
                    if(minX >= timeExtent[0]) {
                        minX = timeExtent[0];
                    }
                    if(maxX <= timeExtent[1]) {
                        maxX = timeExtent[1];
                    }

                    if(minVar >= varExtent[0]) {
                        minVar = varExtent[0];
                    }
                    if(maxVar <= varExtent[1]) {
                        maxVar = varExtent[1];
                    }
                });
                yDomainByVariable[variable] = [minVar, maxVar];
            }/*);*/

            xDomain = [minX, maxX];

            console.log(xDomain);
            console.log(yDomainByVariable);

            var x = d3.scale.linear()
                .range([0, width]);
            
            var y = d3.scale.linear()
                .range([height, 0]);
            
            x.domain(xDomain);
            
            var color = d3.scale.category10();

            color.domain(Array.from($this.data.get(variables[0]).keys()));
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .tickFormat(formatSiPrefix);
            
            var line = d3.svg.line()
                .interpolate("basis")
                .x(function(d) {
                  return x(d.time);
                })
                .y(function(d) {
                  return y(d.value);
                });

            var div = d3.select("#"+this.id+"-temporal");

            console.log(div);

            div.selectAll('svg').remove();

            var svg = div.selectAll('svg')
                .data(variables)
            .enter().append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", function(d, i) { return "translate(" + margin.left + "," + margin.top + ")";});

            //var svg = div.selectAll('svg');
            //console.log(svg);

            svg.append("g")
                .attr("class", "x axisLPLOT")
                .attr("transform", "translate(" + 0 + "," + height + ")")
                .call(xAxis);
            
            svg.append("g")
                .attr("class", "y axisLPLOT")
                .each(function(d) { y.domain(yDomainByVariable[d]); d3.select(this).call(yAxis); });
            
            var simulation = svg.selectAll(".sim")
                .data(function(d){
                    console.log(Array.from($this.data.get(d).entries()));
                    return Array.from($this.data.get(d).entries()); 
                })
            .enter().append("g")
                .attr("class", "sim");
            
            simulation.append("path")
                .attr("class", "line")
                .attr("d", function(d) {
                    return line(d[1]);
                })
                .style("stroke", function(d) {
                    console.log(d);
                    return color(d[0]);
                });

            
            //svg.each(function(d))
            /*svg.attr("width", width + margin.left + margin.right)
                .attr("height", height * $this.data.size)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");*/

            // Set the ticks to stretch across all plots
            //xAxis.tickSize(size * numberVariables);

            console.log(variables);

            /*svg.selectAll(".x.axisLPLOT")
                .data(variables)
            .enter().append("g")
                .attr("class", "x axisLPLOT")
                .attr("transform", function(d, i) { return "translate(" + margin.left + "," + heightEachPlot * (i+1) + ")";})
                .each(function(d) { x.domain(xDomain); d3.select(this).call(xAxis); });

            svg.selectAll(".y.axisLPLOT")
                .data(variables)
            .enter().append("g")
                .attr("class", "y axisLPLOT")
                .attr("transform", function(d, i) { return "translate(" + margin.left + "," + heightEachPlot * i + ")";})
                .each(function(d) { y.domain(yDomainByVariable[d]); d3.select(this).call(yAxis); });*/
        }
    }

    resizePanel() {
        
    }
}