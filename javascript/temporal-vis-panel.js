class TemporalVisPanel extends AbstractPanelBuilder {
    constructor(data, id) {
        super();
        this.id = id;
        this.data = data;
        this.varList = [];
    }

    appendToPanel(panel, id) {
        this.panel = panel;
        panel.append("<svg id=" + id + "-temporal width=\"100%\" height=\"100%\"></svg>");
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
               console.log("Erro ao recuperar dados"); 
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

    }

    resizePanel() {
        
    }
}