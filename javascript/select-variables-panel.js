class SelectVariablesPanel extends AbstractPanelBuilder {
    constructor(ensembleList, id, window) {
        super();
        this.id = id;
        this.variableTree = []; 
        this.window = window;     
    }

    setVariableList(variableList) {
        this.createVariableTree(variableList);
        this.render();
    }

    getVariableTree() {
        return this.variableTree;
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
        panel.append("<div>" +
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
                    "<div>");
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
                                $("input[id=\""+this.id+"\"]").prop("checked", true);
                                $("input[id*=\""+this.id+".\"]").prop("checked", true);
                                //console.log($("input[id*=\""+this.id+".\"]"));
                                if($("input[id=\""+this.id+"\"]").length > 0) {
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
                                $("input[id=\""+this.id+"\"]").prop("checked", false);
                                $("input[id*=\""+this.id+".\"]").prop("checked", false);
                                if($("input[id=\""+this.id+"\"]").length > 0) {
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
                                $("input[id=\""+this.id+"\"]").prop("checked", true);
                                $("input[id*=\""+this.id+".\"]").prop("checked", true);
                                //console.log($("input[id*=\""+this.id+".\"]"));
                                if($("input[id=\""+this.id+"\"]").length > 0) {
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
                                $("input[id=\""+this.id+"\"]").prop("checked", false);
                                $("input[id*=\""+this.id+".\"]").prop("checked", false);
                                if($("input[id=\""+this.id+"\"]").length > 0) {
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
                                $("input[id=\""+this.id+"\"]").prop("checked", true);
                                $("input[id*=\""+this.id+".\"]").prop("checked", true);
                                //console.log($("input[id*=\""+this.id+".\"]"));
                                if($("input[id=\""+this.id+"\"]").length > 0) {
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
                                $("input[id=\""+this.id+"\"]").prop("checked", false);
                                $("input[id*=\""+this.id+".\"]").prop("checked", false);
                                if($("input[id=\""+this.id+"\"]").length > 0) {
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
        this.variablesFancyTree.fancytree('option', 'source', this.variableTree);
    }

    resizePanel(width, height) {

    }

    setWindow(window) {
        this.window = window;
    }

    unmarkColumnCheckboxes(column) {
        console.log(this.variableTree);
        this.variableTree.forEach(function(rootNode, idx) {
            rootNode.children.forEach(function(varNode) {
                // If is sediment, so no children
                /*if(varNode.children.length === 0) {
                    if(column === "temporal") {
                        varNode.data.temporal = false;
                    }
                    else {
                        if(column === "multivariate") {
                            varNode.data.multivariate = false;
                        }
                        else {
                            varNode.data.spatial = false;
                        }
                    }
                }
                else {
                    varNode.children.forEach(function(specieNode) {
                        if(column === "temporal") {
                            specieNode.data.temporal = false;
                        }
                        else {
                            if(column === "multivariate") {
                                specieNode.data.multivariate = false;
                            }
                            else {
                                specieNode.data.spatial = false;
                            }
                        }
                    });
                }*/
                if(column === "temporal") {
                    var id = "cb1-" + varNode.getIndexHier();
                    $("input[id=\""+id+"\"]").prop("checked", false);
                    $("input[id*=\""+id+".\"]").prop("checked", false);
                    if($("input[id=\""+id+"\"]").length > 0) {
                        if(varNode.children !== null) {
                            varNode.children.forEach(function (elem) {
                                elem.data.temporal = false;
                            });
                        }
                        else {
                            varNode.data.temporal = false;
                        }
                    }
                    //console.log(varNode.getIndexHier());
                    //varNode.tr.childNodes[1].childNodes[0].checked = false;
                }
                else {
                    if(column === "multivariate") {
                        var id = "cb2-" + varNode.getIndexHier();
                        $("input[id=\""+id+"\"]").prop("checked", false);
                        $("input[id*=\""+id+".\"]").prop("checked", false);
                        if($("input[id=\""+id+"\"]").length > 0) {
                            if(varNode.children !== null) {
                                varNode.children.forEach(function (elem) {
                                    elem.data.multivariate = false;
                                });
                            }
                            else {
                                varNode.data.multivariate = false;
                            }
                        }
                    }
                    else {
                        var id = "cb3-" + varNode.getIndexHier();
                        $("input[id=\""+id+"\"]").prop("checked", false);
                        $("input[id*=\""+id+".\"]").prop("checked", false);
                        if($("input[id=\""+id+"\"]").length > 0) {
                            if(varNode.children !== null) {
                                varNode.children.forEach(function (elem) {
                                    elem.data.spatial = false;
                                });
                            }
                            else {
                                varNode.data.spatial = false;
                            }
                        }
                    }
                }
            });
        });
    }
}