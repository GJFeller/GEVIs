class BackendRequests {
    constructor() {
        this.url = "http://ensemblemongobackend.azurewebsites.net";
    }

    getListEnsembles() {
        var $this = this;
        return new Promise(function(resolve, reject) {
            var xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(JSON.parse(this.responseText));
            };
            xhttp.onerror = reject;
            xhttp.open("GET", $this.url + "/getAllEnsembles", true);
            xhttp.send();
        });    
    }

    getEnsembleVariables(ensembleId) {
        var $this = this;
        return new Promise(function(resolve, reject) {
            var xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(JSON.parse(this.responseText));
            };
            xhttp.onerror = reject;
            xhttp.open("GET", $this.url + "/getVariablesEnsemble?ensembleId="+ensembleId, true);
            xhttp.send();
        });
    }

    getAllVariables(ensembleId) {
        var $this = this;
        return new Promise(function(resolve, reject) {
            var xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(JSON.parse(this.responseText));
            };
            xhttp.onerror = reject;
            xhttp.open("GET", $this.url + "/getAllVariables?ensembleId="+ensembleId, true);
            xhttp.send();
        });  
    }

    getTemporalData(xIdx, yIdx, zIdx, simulationId, varId, ensembleId) {
        var $this = this;
        return new Promise(function(resolve, reject) {
            var xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(JSON.parse(this.responseText));
            };
            xhttp.onerror = reject;
            xhttp.open("GET", $this.url + "/getTemporalVarData?xIdx="+xIdx+"&yIdx="+yIdx+"&zIdx="+zIdx+"&simulationId="+simulationId+"&varId="+varId+"&ensembleId="+ensembleId, true);
            xhttp.send();
        });  
    }

    getMultivariateData(xIdx, yIdx, zIdx, time, simulationId, varIdList) {
        var $this = this;
        return new Promise(function(resolve, reject) {
            var xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(JSON.parse(this.responseText));
            };
            xhttp.onerror = reject;
            xhttp.open("GET", $this.url + "/getTemporalVarData?xIdx="+xIdx+"&yIdx="+yIdx+"&zIdx="+zIdx+"&time="+time+"&simulationId="+simulationId+"&varIdList="+varIdList, true);
            xhttp.send();
        });  
    }


}