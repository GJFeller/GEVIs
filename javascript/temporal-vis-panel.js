class TemporalVisPanel extends AbstractPanelBuilder {
    constructor(data, id) {
        super();
        this.id = id;
        this.data = data;
        this.varList = [];
    }

    appendToPanel(panel, id) {
        this.panel = panel;
        panel.append("<div id=" + id + "-temporal width=\"100%\" height=\"100%\"></div>"/*<div id=\"legend\" class=\"right-panel\" width=\"20%\" height=\"100%\"></div>"*/);
        
        panel.css({'width':'80%', 'float':'left'});
        this.wholePanel = $("#" + id)
            .find(".ui-resizable")
            .append("<div id=" + id + "-legend></div>");
        console.log(panel);
        this.legendPanel = $("#" + id + "-legend")
        this.legendPanel.css({'margin-left': this.panel.width() + 5, 'width': this.wholePanel.width() - 16 - this.panel.width(), 'height': '100%', 'overflow': 'scroll'});
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
                        */
                    }
                });
                $this.data = $this.reformatDataList(dataList);
                $this.render();
            })
            .catch(function () {
            });
        
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
                chartMap.get(variable).get(simulationId).push({time: time, value: data[variable], variable: variable});
            });
        });

        varStringList.forEach(function (variable) {
            simulationList.forEach(function (simulation) {
                chartMap.get(variable).get(simulation).sort(function (a, b) {
                    return (a.time > b.time) ? 1 : ((b.time > a.time) ? -1 : 0);
                });

            });
        });
        return chartMap;
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

            var div = d3.select("#"+this.id+"-temporal");

            

            div.selectAll('svg').remove();

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


            this.legendPanel.css({'margin-left': this.panel.width() + 5, 'width': this.wholePanel.width() - 16 - this.panel.width(), 'height': '100%', 'overflow': 'scroll'});
            var legendDiv = d3.select("#"+this.id+"-legend");

            //legendDiv.css({"margin-left": $this.panel.width});

            /*legendDiv.style('margin-left', this.panel.width)
                    .attr('width', '20%');*/
            console.log(this.legendPanel);
            console.log(legendDiv);

            legendDiv.selectAll('svg').remove();

            var legendSvgHeight = simulationList.length * 20;
            var legendSvg = legendDiv.append("svg")
                .attr("width", this.legendPanel.width())
                .attr("height", legendSvgHeight);
            

            var legend = legendSvg.selectAll('.legend')
                .data(simulationList)
            .enter().append('g')
                .attr("class", "legend")
                .attr("transform", function(d, i)
                {
                    return "translate(0," + i * 20 + ")";
                });

            legend.append('rect')
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", function(d,i) {
                    console.log(d);
                    console.log(color(d));
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
        this.render();
    }
}