class TemporalVisPanel extends AbstractPanelBuilder {
    constructor(data, id, window) {
        super();
        this.id = id;
        this.data = data;
        this.varList = [];
        this.window = window;
        this.legendElementWidth = 95;
        this.isLegendColumn = false;
        this.query = null;
    }

    appendToPanel(panel, id) {
        this.panel = panel;
        panel.append("<div id=" + id + "-temporal width=\"100%\" height=\"100%\"></div>"/*<div id=\"legend\" class=\"right-panel\" width=\"20%\" height=\"100%\"></div>"*/);
        
        
        this.wholePanel = $("#" + id)
            .find(".ui-resizable")
            .append("<div id=" + id + "-legend></div>");
        panel.css({'width':this.wholePanel.width() - 16 - this.legendElementWidth, 'float':'left'});
        console.log(panel);
        this.legendPanel = $("#" + id + "-legend")
        this.legendPanel.css({'margin-left': this.panel.width() + 5, 'width': this.legendElementWidth, 'height': '100%', 'overflow': 'scroll'});
        this.id = id;
        this.render();
    }

    setEnsemble(ensembleInfo) {
        this.ensembleInfo = ensembleInfo;
        //this.getRemoteData();
    }

    setQuery(query) {
        this.query = query;
        this.getRemoteData();
    }

    getRemoteData() {
        if(this.varList.length > 0) {
            var $this = this;
            if(this.data instanceof Array)
                this.data.splice(0,this.data.length);
            
            var varNameList = [];
            this.varList.forEach(function (variable, idx) {
                varNameList[idx] = variable.variable + "-" + variable.specie;
            });
            //var ensembleId = selectVariablesPanel.getEnsembleList()[0]._id;
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
            //var simulationList = selectVariablesPanel.getEnsembleList()[0].simulations;
            /*var simulationList = ["1D-T25-pH4", "1D-T25-pH5", "1D-T25-pH6", "1D-T25-pH7", "1D-T25-pH8", "1D-T25-pH9",
                                "1D-T80-pH4", "1D-T80-pH5", "1D-T80-pH6", "1D-T80-pH7", "1D-T80-pH8", "1D-T80-pH9",
                                "1D-T160-pH4", "1D-T160-pH5", "1D-T160-pH6", "1D-T160-pH7", "1D-T160-pH8", "1D-T160-pH9"]*/
            this.simulationList = simulationList;
            var promises = [];
            var variableStringList = this.varList[0].id;
            for(var varListIdx = 1; varListIdx < this.varList.length; varListIdx++) {
                variableStringList = variableStringList + "," + this.varList[varListIdx].id;
            }
            for(var i = 0; i < simulationList.length; i++) {
                if(this.query !== null && this.query.selectedCells.length > 0) {
                    for(var j = 0; j < this.query.selectedCells.length; j++) {
                        promises.push(backendConnection.getTemporalData(this.query.selectedCells[j], 0, 0, simulationList[i], variableStringList, ensembleId));
                    }
                }
                else {
                    //promises.push(backendConnection.getTemporalData(0, 0, 0, simulationList[i], variableStringList, ensembleId));
                }    
            }
            Promise.all(promises)
                .then(function(values) {
                    var dataList = [];
                    values.forEach(function (elem) {
                        if(elem.length > 0)
                        {                    
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
                                
                                dataList.push(data);
                            });
                        }
                    });
                    $this.data = $this.reformatDataList(dataList);
                    $this.render();
                })
                .catch(function (err) {
                    console.log("Erro ao pegar dados temporais do servidor");
                    console.log(err.message);
                });
        }
        
    }

    setVariableList(varList) {
        this.varList = varList;
        this.getRemoteData();
    }

    reformatDataList(dataList) {
        var varStringList = [];
        this.varList.forEach(function (variable) {
            varStringList.push(variable.variable + "-" + variable.specie);
        });
        var simulationList = selectedEnsembles[0].simulations;
        console.log(dataList);
        //Set initial data
        var chartMap = new Map();
        var finalData = new Map();
        varStringList.forEach(function (variable) {
            chartMap.set(variable, new Map());
            finalData.set(variable, new Map());
            simulationList.forEach(function (simulation) {
                var simulationData = chartMap.get(variable);
                simulationData.set(simulation, []);
                simulationData = finalData.get(variable);
                simulationData.set(simulation, []);
            });
        });
        console.log(chartMap);
        // Set the whole data
        dataList.forEach(function (data) {
            var simulationId = data.simulationId;
            var time = data.time;
            varStringList.forEach(function (variable) {
                chartMap.get(variable).get(simulationId).push({time: time, value: data[variable], variable: variable});
            });
        });
        // Sort data by time
        varStringList.forEach(function (variable) {
            simulationList.forEach(function (simulation) {
                chartMap.get(variable).get(simulation).sort(function (a, b) {
                    return (a.time > b.time) ? 1 : ((b.time > a.time) ? -1 : 0);
                });
            });
        });

        // Aggregate data by time
        varStringList.forEach(function (variable) {
            simulationList.forEach(function (simulation) {
                var timeSteps = [];
                chartMap.get(variable).get(simulation).forEach(function (obj) {
                    if(timeSteps.indexOf(obj.time) < 0) {
                        timeSteps.push(obj.time);
                    }
                });
                timeSteps.forEach(function (time) {
                    var timeSteps = chartMap.get(variable).get(simulation).filter(function (step) {
                        return step.time === time;
                    });
                    var values = timeSteps.map(a => a.value);
                    var mean = d3.mean(values, function(d){ return d; });
                    finalData.get(variable).get(simulation).push({time: time, value: mean, variable: timeSteps[0].variable});
                });          
            });
        });

        console.log(finalData);
        return finalData;
    }

    render() {

        var margin = {top: 20, right: 20, bottom: 30, left: 50};
        var $this = this;
        var width = this.panel.width() - margin.left - margin.right;
        var height = this.panel.height() - margin.top - margin.bottom;

        var formatSiPrefix = d3.format(".3n");
        //var heightEachPlot = height - margin.top - margin.bottom;

        var xDomain = [],
            yDomainByVariable = {},
            variablesIterable = $this.data.keys(),
            variables = [],
            numberVariables = $this.data.size;

        var div = d3.select("#"+this.id+"-temporal");

            

        div.selectAll('svg').remove();

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
                //console.log(selectVariablesPanel.getEnsembleList()[0].simulations);
                //var simulationList = selectVariablesPanel.getEnsembleList()[0].simulations;
                var simulationList = this.simulationList;
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


            var x = d3.scale.linear()
                .range([0, width]);
            
            var y = new Map();
            variables.forEach(function(variable) {
                y.set(variable, d3.scale.linear().range([height, 0]));
            });
            /*var y = d3.scale.linear()
                .range([height, 0]);*/
            
            x.domain(xDomain);
            
            console.log(chroma);
            var bez = chroma.scale('RdYlBu')
                .colors(simulationList.length);
            console.log(bez);
            var color = d3.scale.ordinal()
                .range(bez)
                .domain(simulationList);
            /*var color = d3.scale.category20();

            color.domain(Array.from($this.data.get(variables[0]).keys()));*/
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = new Map();
            variables.forEach(function(variable) {
                yAxis.set(variable, d3.svg.axis().scale(y.get(variable)).orient("left").tickFormat(formatSiPrefix));
            });

            
            var line = d3.svg.line()
                .interpolate("basis")
                .x(function(d) {
                    return x(d.time);
                })
                .y(function(d) {
                    var yax = y.get(d.variable);
                    return yax(d.value);
                });

            

            var svg = div.selectAll('svg')
                .data(variables)
            .enter().append("svg")
                .attr("width", this.panel.width() - 10)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", function(d, i) { return "translate(" + margin.left + "," + margin.top + ")";});


            svg.append("g")
                .attr("class", "x axisLPLOT")
                .attr("transform", "translate(" + 0 + "," + height + ")")
                .call(xAxis);
            
            svg.append("g")
                .attr("class", "y axisLPLOT")
                .each(function(d) { y.get(d).domain(yDomainByVariable[d]); d3.select(this).call(yAxis.get(d)); })
                .append("text")
                .attr("fill", "#000")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .style("font-size", "10px")
                .text(function(d){ return d; });
            
            var simulation = svg.selectAll(".sim")
                .data(function(d){
                    return Array.from($this.data.get(d).entries()); 
                })
            .enter().append("g")
                .attr("class", "sim");
            
            simulation.append("path")
                .attr("class", "line")
                .attr("d", d => line(d[1])/*function(d) {
                    return line(d[1]);
                }*/)
                .style("stroke", d => color(d[0])/*function(d) {
                    return color(d[0]);
                }*/);


            this.legendPanel.css({'margin-left': this.panel.width() + 5, 'width': this.legendElementWidth, 'height': '100%', 'overflow': 'scroll'});
            var legendDiv = d3.select("#"+this.id+"-legend");

            //legendDiv.css({"margin-left": $this.panel.width});

            /*legendDiv.style('margin-left', this.panel.width)
                    .attr('width', '20%');*/

            legendDiv.selectAll('svg').remove();

            var legendElementHeight = 20;

            var legendElementMaxRowCount = Math.floor(this.legendPanel.height() / legendElementHeight);
            //var legendElementWidth = 90;

            var legendSvgHeight = simulationList.length * legendElementHeight;
            var columnCount = Math.ceil(legendSvgHeight / this.legendPanel.height());
            var panelWidth = this.legendElementWidth * columnCount;

            console.log(this.legendPanel.height())
            console.log(legendElementMaxRowCount);
            console.log(legendSvgHeight);
            console.log(columnCount);
            console.log(panelWidth);


            if(this.isLegendColumn) {
                var legendSvg = legendDiv.append("svg")
                    .attr("width", panelWidth)
                    .attr("height", this.legendPanel.height());
                
                
                var legend = legendSvg.selectAll('.legend')
                    .data(simulationList)
                .enter().append('g')
                    .attr("class", "legend")
                    .attr("transform", function(d, i)
                    {
                        return "translate("+ Math.floor(i/legendElementMaxRowCount) * $this.legendElementWidth + "," + (i % legendElementMaxRowCount)  * legendElementHeight + ")";
                    });

                legend.append('rect')
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", 10)
                    .attr("height", 10)
                    .style("fill", function(d,i) {
                        return color(d)
                    });

                legend.append('text')
                    .attr("x", 20)
                    .attr("y", 10)
                    .text(function(d, i) {
                        return d;
                    })
                    .style("text-anchor", "start")
                    .style("font-size", 12);
            } else {

                var legendSvg = legendDiv.append("svg")
                    .attr("width", this.legendPanel.width())
                    .attr("height", legendSvgHeight);
                

                var legend = legendSvg.selectAll('.legend')
                    .data(simulationList)
                .enter().append('g')
                    .attr("class", "legend")
                    .attr("transform", function(d, i)
                    {
                        return "translate(0," + i * legendElementHeight + ")";
                    });

                legend.append('rect')
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", 10)
                    .attr("height", 10)
                    .style("fill", function(d,i) {
                        return color(d)
                    });

                legend.append('text')
                    .attr("x", 20)
                    .attr("y", 10)
                    .text(function(d, i) {
                        return d;
                    })
                    .style("text-anchor", "start")
                    .style("font-size", 12);
            }

                /*.attr("transform", function(d, i) { return "translate(" + margin.left + "," + margin.top + ")";});*/



            
            //svg.each(function(d))
            /*svg.attr("width", width + margin.left + margin.right)
                .attr("height", height * $this.data.size)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");*/

            // Set the ticks to stretch across all plots
            //xAxis.tickSize(size * numberVariables);

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
        this.panel.css({'width':this.wholePanel.width() - 16 - this.legendElementWidth, 'float':'left'});
        this.render();
    }

    setWindow(window) {
        this.window = window;
    }
}