class SelectEnsemblePanel extends AbstractPanelBuilder {
    constructor(ensembleList, id, window) {
        super();
        this.createEnsembleTree(ensembleList);
        this.id = id;
        this.ensembleList = ensembleList;
        //this.variableTree = []; 
        this.window = window;     
    }

    setEnsembleList(ensembleList) {
        this.ensembleList = ensembleList;
        this.createEnsembleTree(ensembleList);
        this.render();
    }

    getEnsembleList() {
        return this.ensembleList;
    }

    createEnsembleTree(ensembleList) {
        this.ensembleTree = [];
        for(var idx = 0; idx < ensembleList.length; idx++) {
            var element = ensembleList[idx];
            var dict = {};
            dict.title = element.ensembleId;
            dict.checkbox = true;
            var children = [];
            element.simulations.forEach(function(sim) {
                var childDict = {};
                childDict.title = sim;
                childDict.checkbox = false;
                children.push(childDict);
            });
            dict.children = children;
            /*if(idx == 0) {
                dict.selected = true;
            }
            else {
                dict.selected = false;
            }*/
            
            this.ensembleTree.push(dict);
        }
    }

    appendToPanel(panel, id) {
        var $this = this;
        this.panel = panel;
        panel.append("<div id=" + id + "-ensemblecontainer>" +
                        "<div id=\"" + id + "-ensembletree\" class=\"\"></div>" +
                    "</div>");
        this.id = id;
        var glyph_opts = {
            //preset: "bootstrap3",
            map: {
                doc: "glyphicon glyphicon-file",
                docOpen: "glyphicon glyphicon-file",
                checkbox: "glyphicon glyphicon-unchecked",
                checkboxSelected: "glyphicon glyphicon-check",
                checkboxUnknown: "glyphicon glyphicon-share",
                dragHelper: "glyphicon glyphicon-play",
                dropMarker: "glyphicon glyphicon-arrow-right",
                error: "glyphicon glyphicon-warning-sign",
                expanderClosed: "glyphicon glyphicon-menu-right",
                expanderLazy: "glyphicon glyphicon-menu-right",  // glyphicon-plus-sign
                expanderOpen: "glyphicon glyphicon-menu-down",  // glyphicon-collapse-down
                folder: "glyphicon glyphicon-folder-close",
                folderOpen: "glyphicon glyphicon-folder-open",
                loading: "glyphicon glyphicon-refresh glyphicon-spin"
            }
        };
        
        this.ensembleFancyTree = $("#" + this.id + "-ensembletree").fancytree({
            checkbox: true,
            extensions: ["glyph"],
            selectMode: 2,
            icon: false,
            glyph: glyph_opts,
            source: this.ensembleTree,
            select: function(event, data) {
                var selNodes = data.tree.getSelectedNodes();
                console.log(selNodes);
                selectedEnsemblesKeys = $.map(selNodes, function(node){
                    return node.title;
                 });
                document.dispatchEvent(ensembleSelectionChanged);
            }
        });
        this.render();
    }

    render() {
        this.ensembleFancyTree.fancytree('option', 'source', this.ensembleTree);
    }

    resizePanel(width, height) {

    }

    setWindow(window) {
        this.window = window;
    }
}