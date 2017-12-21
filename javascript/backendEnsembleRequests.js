class BackendRequests {
    constructor() {
        //this.url = "http://ensemblemongobackend.azurewebsites.net";
        this.url = "http://gcevt-backend.herokuapp.com";
        //this.url = "http://localhost:8002";
    }

    getListEnsembles() {
        var $this = this;
        return new Promise(function(resolve, reject) {
            var xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(JSON.parse(this.responseText));
            };
            xhttp.onerror = reject;
            //xhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
            //xhttp.withCredentials = true;
            //xhttp.setRequestHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
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
            xhttp.open("GET", $this.url + "/getVariablesEnsemble/"+ensembleId, true);
            xhttp.send();
        });
    }

    getAllVariables() {
        var $this = this;
        return new Promise(function(resolve, reject) {
            var xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(JSON.parse(this.responseText));
            };
            xhttp.onerror = reject;
            xhttp.open("GET", $this.url + "/getAllVariables", true);
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
            xhttp.open("GET", $this.url + "/getTemporalVarData/"+xIdx+"/"+yIdx+"/"+zIdx+"/"+simulationId+"/"+varId+"/"+ensembleId, true);
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
            xhttp.open("GET", $this.url + "/getTemporalVarData/"+xIdx+"/"+yIdx+"/"+zIdx+"/"+time+"/"+simulationId+"/"+varIdList, true);
            xhttp.send();
        });  
    }


}