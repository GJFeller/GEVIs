class SelectVariablesPanel extends AbstractPanelBuilder {
    constructor(ensembleList, id) {
        super();
        this.createEnsembleTree(ensembleList);
        this.id = id;
        this.variableTree = [];      
    }

    setEnsembleList(ensembleList) {
        //console.log(this.createEnsembleTree(ensembleList));
        this.createEnsembleTree(ensembleList);
        this.render();
    }

    setVariableList(variableList) {
        this.variableTree = variableList;
        this.render();
    }

    createEnsembleTree(ensembleList) {
        console.log(ensembleList);
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
            if(idx == 0) {
                dict.selected = true;
            }
            else {
                dict.selected = false;
            }
            
            this.ensembleTree.push(dict);
        }
        /*ensembleList.forEach(function(element, idx) {
            var dict = {};
            dict.title = element.ensembleId;
            var children = [];
            element.simulations.forEach(function(sim) {
                var childDict = {};
                childDict.title = sim;
                childDict.checkbox = false;
                children.push(childDict);
            });
            dict.children = children;
            if(idx = 0) {
                dict.selected = true;
            }
            else {
                dict.selected = false;
            }
            
            this.ensembleTree.push(dict);
        });*/
        console.log(this.ensembleTree);
    }

    createVariableTree(variableList) {
        return variableList;
    }

    appendToPanel(panel, id) {
        this.panel = panel;
        panel.append("<div id=" + id + "-accordion width=\"100%\">" +
                        "<h3>Ensemble List</h3>" +
                            "<div id=" + id + "-ensemblecontainer><div id=\"" + id + "-ensembletree\" class=\"\"></div></div>" +
                        "<h3>Variable List</h3>" +
                        "<div>" +
                            "<table id=" + id + "-variabletree width=\"100%\">" +
                                "<colgroup>" +
                                    "<col width=\"25%\">" +
                                    "<col width=\"25%\">" +
                                    "<col width=\"25%\">" +
                                    "<col width=\"25%\">" +
                                "</colgroup>" +
                                "<thead>" +
                                    "<tr><th></th><th>Temporal</th><th>Spatial</th><th>Multivariate</th></tr>" +
                                "</thead>" +
                                "<tbody>" +
                                    "<tr>" +
                                        "<td></td>" +
                                        "<td class=\"alignCenter\"><input name=\"cb1\" type=\"checkbox\"></td>" +
                                        "<td class=\"alignCenter\"><input name=\"cb2\" type=\"checkbox\"></td>" +
                                        "<td class=\"alignCenter\"><input name=\"cb3\" type=\"checkbox\"></td>" +
                                    "</tr>" +
                                "</tbody>" +
                            "</table>" +
                        "<div>" + 
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
            selectMode: 1,
            icon: false,
            glyph: glyph_opts,
            source: this.ensembleTree
        });

        this.variablesFancyTree = $("#" + this.id + "-variabletree").fancytree({
            extensions: ["glyph"],
            selectMode: 3,
            icon: false,
            glyph: glyph_opts,
            source: this.variableTree
        });
        this.render();
    }

    render() {
        
        this.ensembleFancyTree.fancytree('option', 'source', this.ensembleTree);
        this.variablesFancyTree.fancytree('option', 'source', this.variableTree);

        $("#" + this.id + "-accordion").accordion({
            heightStyle: "content",
            collapsible:true,
            beforeActivate: function(event, ui) {
                // The accordion believes a panel is being opened
                if (ui.newHeader[0]) {
                    var currHeader  = ui.newHeader;
                    var currContent = currHeader.next('.ui-accordion-content');
                    // The accordion believes a panel is being closed
                } else {
                    var currHeader  = ui.oldHeader;
                    var currContent = currHeader.next('.ui-accordion-content');
                }
                // Since we've changed the default behavior, this detects the actual status
                var isPanelSelected = currHeader.attr('aria-selected') == 'true';
                // Toggle the panel's header
                currHeader.toggleClass('ui-corner-all',isPanelSelected).toggleClass('accordion-header-active ui-state-active ui-corner-top',!isPanelSelected).attr('aria-selected',((!isPanelSelected).toString()));
                // Toggle the panel's icon
                currHeader.children('.ui-icon').toggleClass('ui-icon-triangle-1-e',isPanelSelected).toggleClass('ui-icon-triangle-1-s',!isPanelSelected);
                // Toggle the panel's content
                currContent.toggleClass('accordion-content-active',!isPanelSelected)
                if (isPanelSelected) { currContent.slideUp(); }  else { currContent.slideDown(); }

                return false; // Cancels the default action
            }
        });
    }

    resizePanel(width, height) {

    }
}