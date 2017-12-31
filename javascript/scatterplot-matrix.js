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
        var simulationList = selectVariablesPanel.getEnsembleList()[0].simulations;
        console.log(simulationList);
        for(var i = 0; i < simulationList.length; i++) {
            for(var j = 0; j < this.varList.length; j++) {
                backendConnection.getMultivariateData(0, 0, 0, 0, simulationList[i], this.varList[j].id)
                    .then(function(result) {
                        console.log(result);
                    });
            }
        }
        //backendConnection.getMultivariateData(0, 0, 0, 0, )
        //console.log(backendConnection);
    }

    setVariableList(varList) {
        this.varList = varList;
        this.getRemoteData();
        this.render();
    }

    render() {
        var width = this.panel.width();
        var height = this.panel.height();
        var margin = {top: 30, right: 30, bottom: 30, left: 50};
        var padding = 20;
        var numberVariables = 4;
        var sizeW = width / numberVariables;
        var sizeH = height / numberVariables;

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

        var svg = d3.select("#"+this.id+"-scatter");
        svg.append("g")
            .attr("transform", "translate(" + padding + margin.left + "," + padding / 2 + ")")

    }

    brushstart(p) {

    }

    brushmove(p) {

    }

    brushend(p) {

    }

    resizePanel(width, height) {
        console.log(width);
        console.log(height);
    }

}