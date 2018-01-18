class ScatterplotMatrix extends AbstractPanelBuilder {
    constructor(data, id) {
        super();
        this.id = id;
        this.data = data;
        this.varList = [];
    }

    appendToPanel(panel, id) {
        this.panel = panel;
        panel.append("<svg id=" + id + "-scatter width=\"100%\" height=\"100%\"></svg>");
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
        var simulationList = selectVariablesPanel.getEnsembleList()[0].simulations;
        var promises = [];
        for(var i = 0; i < simulationList.length; i++) {
            var variableStringList = this.varList[0].id;
            for(var j = 1; j < this.varList.length; j++) {
                variableStringList = variableStringList + "," + this.varList[j].id;
            }
            promises.push(backendConnection.getMultivariateData(0, 0, 0, 0, simulationList[i], variableStringList));
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
                $this.data = dataList;
                $this.render();
            });
    }

    setVariableList(varList) {
        this.varList = varList;
        this.getRemoteData();
    }

    render() {
        var $this = this;
        var width = this.panel.width();
        var height = this.panel.height();
        var margin = {top: 30, right: 30, bottom: 30, left: 50};
        var padding = 20;

        var svg = d3.select("#"+this.id+"-scatter");

        svg.selectAll('*').remove();
        //console.log(this.data);
        if(this.data.length > 0) {
            var domainByVariable = {},
                variables = d3.keys(this.data[0]).filter(function (d) { return d !== "simulationId" && d !== "time"; }),
                numberVariables = variables.length;
            
            // Get Min and Max of each of the columns
            variables.forEach(function(variable) {
                domainByVariable[variable] = d3.extent($this.data, function(d) {
                    return d[variable];
                });
            });

            console.log(domainByVariable);

            var size = 0;
            if(height < width) {
                size = height / numberVariables;
            }
            else {
                size = width / numberVariables;
            }

            var formatSiPrefix = d3.format("3e");

            var x = d3.scale.linear()
                .range([padding / 2, size - padding / 2]);
            
            var y = d3.scale.linear()
                .range([size - padding / 2, padding / 2]);
            
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(6)
                .tickFormat(formatSiPrefix);

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(6)
                .tickFormat(formatSiPrefix);

            var brush = d3.svg.brush()
                .x(x)
                .y(y)
                .on("brushstart", brushstart)
                .on("brush", brushmove)
                .on("brushend", brushend);;
            
            

            svg.attr("width", size * numberVariables + padding + margin.left + margin.right)
                .attr("height", size * numberVariables + padding + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + padding + "," + padding / 2 + ")");
            
            // Set the ticks to stretch across all plots
            xAxis.tickSize(size * numberVariables);
            yAxis.tickSize(-size * numberVariables); // negative so ticks go right

            console.log(variables);

            svg.selectAll(".x.axisSPLOTM")
                .data(variables)
            .enter().append("g")
                .attr("class", "x axisSPLOTM")
                .attr("transform", function(d, i) { return "translate(" + ((i) * size + margin.left) + ",0)";})
                .each(function(d) { x.domain(domainByVariable[d]); d3.select(this).call(xAxis); });

            svg.selectAll(".y.axisSPLOTM")
                .data(variables)
            .enter().append("g")
                .attr("class", "y axisSPLOTM")
                .attr("transform", function(d, i) { return "translate(" + margin.left + "," + i * size + ")";})
                .each(function(d) { y.domain(domainByVariable[d]); d3.select(this).call(yAxis); });

            var cell = svg.selectAll(".cellSPLOTM")
                .data(cross(variables, variables))
            .enter().append("g")
                .attr("class", "cellSPLOTM");
                /*.attr("transform", function(d) { return "translate(" + ((d.i) * size + margin.left) + "," + d.j * size + ")"; })
                .each(plot);*/

            cell.filter(function(d) { return d.i !== d.j; })
                .attr("transform", function(d) { return "translate(" + ((d.i) * size + margin.left) + "," + d.j * size + ")"; })
                .each(plot);

            cell.filter(function(d) { return d.i === d.j; })
                .attr("transform", function(d) { return "translate(" + ((d.i) * size + margin.left) + "," + d.j * size + ")"; })
                .each(plot);
                //.each(plotHistogram);
            // Titles for the diagonal.
            cell.filter(function(d) { return d.i === d.j; }).append("text")
                .attr("x", padding)
                .attr("y", padding)
                .attr("dy", ".71em")
                .text(function(d) { return d.x; });

            // Create each x-axis
            /*svg.selectAll(".x.axis")
                .data(variables)
            .enter().append("g")
                .attr("class", "x axis")
                .attr("transform", function(d, i) { return "translate(" + (numberVariables - i - 1) * size + ",0)"; })
                .each(function(d) { 
                    x.domain(domainByVariable[d]);
                    d3.select(this).call(xAxis);
                });

            // Create each y-axis
            svg.selectAll(".y.axis")
                .data(variables)
            .enter().append("g")
                .attr("class", "y axis")
                .attr("transform", function(d, i) { 
                    return "translate(0," + i * size + ")";
                })
                .each(function(d) {
                    y.domain(domainByVariable[d]);
                    d3.select(this).call(yAxis);
                });
            
            var cell = svg.selectAll(".cell")
                .data(cross(variables, variables))
                .enter().append("g")
                .attr("class", "cell") ;
          
            cell.filter(function(d) { return d.i !== d.j; })
                .attr("transform", function(d) { return "translate(" + (numberVariables - d.i - 1) * size + "," + d.j * size + ")"; })
                .each(plot);
          
            cell.filter(function(d) { return d.i === d.j; })
                .attr("transform", function(d) { return "translate(" + (numberVariables - d.i - 1) * size + "," + d.j * size + ")"; })
                .each(plotHistogram);
          
            // Titles for the diagonal.
            cell.filter(function(d) { return d.i === d.j; }).append("text")
                .attr("x", padding)
                .attr("y", padding)
                .attr("dy", ".71em")
            .text(function(d) { return d.x; });*/

            // Run the brush
            cell.call(brush);

            function plot(p) {
                var cell = d3.select(this);
                
                x.domain(domainByVariable[p.x]);
                y.domain(domainByVariable[p.y]);
                
                cell.append("rect")
                    .attr("class", "frameSPLOTM")
                    .attr("x", padding / 2)
                    .attr("y", padding / 2)
                    .attr("width", size - padding)
                    .attr("height", size - padding);
                    //.style("fill", function(d) { return d3.rgb(255,255,255); });
                
                cell.selectAll("circle")
                    .data($this.data)
                .enter().append("circle")
                    .attr("cx", function(d) { return x(d[p.x]); })
                    .attr("cy", function(d) { return y(d[p.y]); })
                    .attr("r", 4)
                    .attr("x-value", function(d) {return d[p.x]; })
                    .attr("y-value", function(d) {return d[p.y]; })
                    .style("fill", function(d) { return d3.rgb(0,0,255); });
            }

            function plotHistogram(p) {
                var cell = d3.select(this);
            
                x.domain(domainByVariable[p.x]);
                y.domain(domainByVariable[p.y]);
            
                cell.append("rect")
                    .attr("class", "frameSPLOTM")
                    .attr("x", padding / 2)
                    .attr("y", padding / 2)
                    .attr("width", size - padding)
                    .attr("height", size - padding)
                    .attr("fill", "white")
                    .attr("stroke","#aaa");
            
                // Extract data for histogramming into single array
                var histData = $this.data.map(function(d) {
                  return +d[p.x] ;
                });
            
                // Generate a histogram using twenty uniformly-spaced bins.
                var hist = d3.layout.histogram()
                  .bins(x.ticks(20))
                  (histData);
            
                var histScale = d3.scale.linear()
                .domain([0, d3.max(hist, function(d) { return d.y; })])
                .range([size - padding / 2, padding / 2]);
            
                var bar = cell.selectAll(".bar")
                  .data(hist)
                  .enter().append("g")
                  .attr("class", "bar")
                  .classed("histogram",true)
                  .attr("transform", function(d) {
                    return "translate(" + x(d.x) + "," + histScale(d.y) + ")";
                  });
            
                bar.append("rect")
                .attr("x", 1)
                .attr("width", 5) //x(hist[0].dx) )
                .attr("height", function(d) {
                  return size - padding / 2 - histScale(d.y);
                });
            }

            var brushCell;
            
            // Clear the previously-active brush, if any.
            function brushstart(p) {
                if (brushCell !== this) {
                    d3.select(brushCell).call(brush.clear());
                    x.domain(domainByVariable[p.x]);
                    y.domain(domainByVariable[p.y]);
                    brushCell = this;
                }
            }
            
            // Highlight the selected circles.
            function brushmove(p) {
                var e = brush.extent();
                /*svg.selectAll("circle").classed("hiddenSPLOTM", function(d) {
                    d.hidden = e[0][0] > d[p.x] || d[p.x] > e[1][0]
                    || e[0][1] > d[p.y] || d[p.y] > e[1][1];
                    return d.hidden;
                });*/
            }
            
            // If the brush is empty, select all circles.
            function brushend() {
                if (brush.empty()) svg.selectAll(".hiddenSPLOTM").classed("hiddenSPLOTM", false);
            }

            function cross(a, b) {
                var c = [], n = a.length, m = b.length, i, j;
                for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
                return c;
            }

        }
        /*var numberVariables = 1;
        if(this.data.length > 0)
            numberVariables = this.data[0].variables.length;
        var sizeW = (width / numberVariables) - (numberVariables-1)*padding - margin.right - margin.left;
        var sizeH = (height / numberVariables) - (numberVariables-1)*padding - margin.top - margin.bottom;

        var x = d3.scale.linear()
            .range([padding / 2, sizeW - padding / 2]);
        
        var y = d3.scale.linear()
            .range([sizeH - padding / 2, padding / 2]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(6);
        
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(6);
        
        xAxis.tickSize(sizeW * numberVariables)
            .tickFormat(d3.format(".3e"));
        yAxis.tickSize(-sizeH * numberVariables)
            .tickFormat(d3.format(".3e"));
        
        var brush = d3.svg.brush()
            .x(x)
            .y(y)
            .on("brushstart", this.brushstart)
            .on("brush", this.brushmove)
            .on("brushend", this.brushend);

        // Position scales.
        var position = {};
        /*flower.traits.forEach(function(trait) {
        function value(d) { return d[trait]; }
        position[trait] = d3.scale.linear()
            .domain([d3.min(flower.values, value), d3.max(flower.values, value)])
            .range([padding / 2, size - padding / 2]);
        });

        var svg = d3.select("#"+this.id+"-scatter");
        svg.append("g")
            .attr("transform", "translate(" + padding + margin.left + "," + padding / 2 + ")")*/

    }

    brushstart(p) {

    }

    brushmove(p) {

    }

    brushend(p) {

    }

    resizePanel(width, height) {
        this.render();
    }

}