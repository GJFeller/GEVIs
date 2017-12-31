class SelectVariablesPanel extends AbstractPanelBuilder {
    constructor(ensembleList, id) {
        super();
        this.createEnsembleTree(ensembleList);
        this.id = id;
        this.ensembleList = ensembleList;
        this.variableTree = [];      
    }

    setEnsembleList(ensembleList) {
        this.ensembleList = ensembleList;
        this.createEnsembleTree(ensembleList);
        this.render();
    }

    getEnsembleList() {
        return this.ensembleList;
    }

    setVariableList(variableList) {
        this.createVariableTree(variableList);
        this.render();
    }

    getVariableTree() {
        return this.variableTree;
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
            if(idx == 0) {
                dict.selected = true;
            }
            else {
                dict.selected = false;
            }
            
            this.ensembleTree.push(dict);
        }
    }

    createVariableTree(variableList) {
        this.variableTree = [];
        var dict = {};
        dict.title = "Sediment";
        dict.children = [];
        this.variableTree.push(dict);
        dict = {};
        dict.title = "Solid";
        dict.children = [];
        this.variableTree.push(dict);
        dict = {};
        dict.title = "Solute";
        dict.children = [];
        this.variableTree.push(dict);
        for(var idx = 0; idx < variableList.length; idx++) {
            var element = variableList[idx];
            var name = element.name;
            var type = element.type;
            var specie = element.specie;
            var id = element._id;
            var unit = element.unit;
            if(type.toLowerCase() != "element") {
                switch(type.toLowerCase()) {
                    case "solid":
                        type = "Solid";
                        break;
                    case "solute":
                        type = "Solute";
                        break;
                    case "sediment":
                        type = "Sediment";
                        break;
                    default:
                        break;
                }
                this.variableTree.forEach(function(rootNode, idx) {
                    if(rootNode.title == type) {
                        var wasAddedVarLevel = false;
                        rootNode.children.forEach(function (varNode, idx) {
                            if(varNode.title == name) {
                                if(type != "Sediment") {
                                    wasAddedVarLevel = true;
                                    varNode.children.push({title: specie, key: id, temporal: false, multivariate: false, spatial: false, unit: unit});
                                }
                            }
                        });
                        if(!wasAddedVarLevel) {
                            if(type != "Sediment") {
                                rootNode.children.push({
                                    title: name,
                                    children: [{title: specie, key: id, temporal: false, multivariate: false, spatial: false, unit: unit}]
                                });
                            }
                            else {
                                rootNode.children.push({title: name, key: id, temporal: false, multivariate: false, spatial: false, unit: unit});
                            }
                        }
                    }
                });

            }
        }
    }

    appendToPanel(panel, id) {
        var $this = this;
        this.panel = panel;
        panel.append("<div id=" + id + "-accordion width=\"100%\" height=\"100%\">" +
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
                                    "<tr><th></th><th style=\"text-align:center\">Temporal</th><th style=\"text-align:center\">Multivariate</th><th style=\"text-align:center\">Spatial</th></tr>" +
                                "</thead>" +
                                "<tbody>" +
                                    "<!--<tr>" +
                                        "<td></td>" +
                                        "<td><input name=\"cb1\" type=\"checkbox\"></td>" +
                                        "<td><input name=\"cb2\" type=\"checkbox\"></td>" +
                                        "<td><input name=\"cb3\" type=\"checkbox\"></td>" +
                                    "</tr>-->" +
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
            extensions: ["glyph", "table"],
            selectMode: 3,
            icon: false,
            glyph: glyph_opts,
            source: this.variableTree,
            table: {
                indentation: 10,
                nodeColumnIdx: 0
              },                          
            renderColumns: function(event, data) {
                var node = data.node,
                $tdList = $(node.tr).find(">td");
                node.checkbox = false;
                var $tree = this;
                if(node.getLevel() !== 1) {
                    var id1 = "cb1-" + node.getIndexHier();
                    var id2 = "cb2-" + node.getIndexHier();
                    var id3 = "cb3-" + node.getIndexHier();
                    $("<input />", { type: "checkbox", id: id1, checked: node.data.temporal })
                        .change(function() {
                            console.log($tree);
                            if(this.checked) {
                                $("input[id*=\""+this.id+"\"]").prop("checked", true);
                                if($("input[id*=\""+this.id+"\"]").length > 0) {
                                    if(node.children !== null) {
                                        node.children.forEach(function (elem) {
                                            elem.data.temporal = true;
                                        });
                                    }
                                    else {
                                        node.data.temporal = true;
                                    }
                                }
                            }
                            else {
                                $("input[id*=\""+this.id+"\"]").prop("checked", false);
                                if($("input[id*=\""+this.id+"\"]").length > 0) {
                                    if(node.children !== null) {
                                        node.children.forEach(function (elem) {
                                            elem.data.temporal = false;
                                        });
                                    }
                                    else {
                                        node.data.temporal = false;
                                    }
                                }
                            }
                            $this.variableTree = $tree.rootNode.children;
                            document.dispatchEvent(varChangeEvent);
                        })
                        .appendTo($tdList.eq(1));
                    $("<input />", { type: "checkbox", id: id2, checked: node.data.multivariate })
                        .change(function() {
                            if(this.checked) {
                                $("input[id*=\""+this.id+"\"]").prop("checked", true);
                                if($("input[id*=\""+this.id+"\"]").length > 0) {
                                    if(node.children !== null) {
                                        node.children.forEach(function (elem) {
                                            elem.data.multivariate = true;
                                        });
                                    }
                                    else {
                                        node.data.multivariate = true;
                                    }
                                }
                            }
                            else {
                                $("input[id*=\""+this.id+"\"]").prop("checked", false);
                                if($("input[id*=\""+this.id+"\"]").length > 0) {
                                    if(node.children !== null) {
                                        node.children.forEach(function (elem) {
                                            elem.data.multivariate = false;
                                        });
                                    }
                                    else {
                                        node.data.multivariate = false;
                                    }
                                }
                            }
                            $this.variableTree = $tree.rootNode.children;
                            document.dispatchEvent(varChangeEvent);
                        })
                        .appendTo($tdList.eq(2));
                    $("<input />", { type: "checkbox", id: id3, checked: node.data.spatial })
                        .change(function() {
                            if(this.checked) {
                                $("input[id*=\""+this.id+"\"]").prop("checked", true);
                                if($("input[id*=\""+this.id+"\"]").length > 0) {
                                    if(node.children !== null) {
                                        node.children.forEach(function (elem) {
                                            elem.data.spatial = true;
                                        });
                                    }
                                    else {
                                        node.data.spatial = true;
                                    }
                                }
                            }
                            else {
                                $("input[id*=\""+this.id+"\"]").prop("checked", false);
                                if($("input[id*=\""+this.id+"\"]").length > 0) {
                                    if(node.children !== null) {
                                        node.children.forEach(function (elem) {
                                            elem.data.spatial = false;
                                        });
                                    }
                                    else {
                                        node.data.spatial = false;
                                    }
                                }
                            }
                            $this.variableTree = $tree.rootNode.children;
                            document.dispatchEvent(varChangeEvent);
                        })
                        .appendTo($tdList.eq(3));
                    
                    
                    $tdList.eq(1).attr("align", "center");
                    $tdList.eq(2).attr("align", "center");
                    $tdList.eq(3).attr("align", "center");
                }
            }                
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