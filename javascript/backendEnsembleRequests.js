class BackendRequests {
    constructor() {
        this.url = "http://ensemblemongobackend.azurewebsites.net";
    }

    getListEnsembles() {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", this.url + "/getAllEnsembles", true);
        xhttp.send();
    }

    getEnsembleVariables(ensembleId) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", this.url + "/getVariablesEnsemble/ensembleId="+ensembleId, true);
        xhttp.send();
    }

    getAllVariables(ensembleId) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", this.url + "/getAllVariables/ensembleId="+ensembleId, true);
        xhttp.send();
    }

    getTemporalData(xIdx, yIdx, zIdx, simulationId, varId, ensembleId) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", this.url + "/getTemporalVarData/xIdx="+xIdx+"&yIdx="+yIdx+"&zIdx="+zIdx+"&simulationId="+simulationId+"&varId="+varId+"&ensembleId="+ensembleId, true);
        xhttp.send();
    }

    getMultivariateData(xIdx, yIdx, zIdx, time, simulationId, varIdList) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", this.url + "/getTemporalVarData/xIdx="+xIdx+"&yIdx="+yIdx+"&zIdx="+zIdx+"&time="+time+"&simulationId="+simulationId+"&varIdList="+varIdList, true);
        xhttp.send();
    }


}