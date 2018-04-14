class BackendRequests {
    constructor() {
        //this.url = "http://ensemblemongobackend.azurewebsites.net";
        //this.url = "https://gcevt-backend.herokuapp.com";
        this.url = "http://localhost:4000";
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
            console.log("Accessing " + xhttp.responseURL);
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

    getSolidVariables(ensembleId) {
        var $this = this;
        return new Promise(function(resolve, reject) {
            var xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(JSON.parse(this.responseText));
            };
            xhttp.onerror = reject;
            xhttp.open("GET", $this.url + "/getSolidVariables/"+ensembleId, true);
            xhttp.send();
        });
    }

    getSoluteVariables(ensembleId) {
        var $this = this;
        return new Promise(function(resolve, reject) {
            var xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(JSON.parse(this.responseText));
            };
            xhttp.onerror = reject;
            xhttp.open("GET", $this.url + "/getSoluteVariables/"+ensembleId, true);
            xhttp.send();
        });
    }

    getSedimentVariables(ensembleId) {
        var $this = this;
        return new Promise(function(resolve, reject) {
            var xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(JSON.parse(this.responseText));
            };
            xhttp.onerror = reject;
            xhttp.open("GET", $this.url + "/getSedimentVariables/"+ensembleId, true);
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
            //console.log($this.url + "/getTemporalVarData/"+xIdx+"/"+yIdx+"/"+zIdx+"/"+simulationId+"/"+varId+"/"+ensembleId);
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
            xhttp.open("GET", $this.url + "/getMultivariateData/"+xIdx+"/"+yIdx+"/"+zIdx+"/"+time+"/"+simulationId+"/"+varIdList, true);
            xhttp.send();
        });  
    }

    getSpatialData(time, simulationId, varIdList) {
        var $this = this;
        return new Promise(function(resolve, reject) {
            var xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(JSON.parse(this.responseText));
            };
            xhttp.onerror = reject;
            xhttp.open("GET", $this.url + "/getSpatialData/"+time+"/"+simulationId+"/"+varIdList, true);
            xhttp.send();
        });  
    }

    getCellQuantity(ensembleId) {
        var $this = this;
        return new Promise(function(resolve, reject) {
            var xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(this.responseText);
            };
            xhttp.onerror = reject;
            //console.log($this.url + "/getTemporalVarData/"+xIdx+"/"+yIdx+"/"+zIdx+"/"+simulationId+"/"+varId+"/"+ensembleId);
            xhttp.open("GET", $this.url + "/getCellQuantity/"+ensembleId, true);
            xhttp.send();
        });
    }

    getTimeEnd(ensembleId) {
        var $this = this;
        return new Promise(function(resolve, reject) {
            var xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(this.responseText);
            };
            xhttp.onerror = reject;
            //console.log($this.url + "/getTemporalVarData/"+xIdx+"/"+yIdx+"/"+zIdx+"/"+simulationId+"/"+varId+"/"+ensembleId);
            xhttp.open("GET", $this.url + "/getTimeEnd/"+ensembleId, true);
            xhttp.send();
        });
    }


}