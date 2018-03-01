/*
 * Created by Rodrigo on 25/05/2017.
 */

class Window {
    constructor(id, title, parent, panelContent) {
        this.id = id;
        this.title = title;
        this.panelContent = panelContent;
        this.parent = parent;
        //this.callback = callback;
        /* Initial values of panel Height and Width */
        this.INITIAL_HEIGHT = 350;
        this.INITIAL_WIDTH = 350;

        /* Max values of panel Height and Width */
        this.MAX_HEIGHT = 1080;
        this.MAX_WIDTH = 1080;

        /* Constant values of icon Height and Width */
        this.HEIGHT_ICON = 28;
        this.WIDTH_ICON = 28;

        this.children = [];

        this.createNewChild(id, title, parent, panelContent);

        this.panelContent.setWindow(this);
    }

    static getCenter(obj) {

        var $this = $("#" + obj);
        var offset = $this.offset();
        var width = $this.width();
        var height = $this.height();
        var getSvg = $('#workspace');
        var centerX = offset.left + width / 2 -  getSvg.offset().left;
        var centerY = offset.top + height / 2 - getSvg.offset().top;
        var arr = [];
        arr["x"] = centerX;
        arr["y"] = centerY;
        return arr;
    }

    static centerLine(panelID, icon) {
        if (typeof icon === 'undefined') { icon = false; }
        var lines =  d3.selectAll("line").filter(".class-" + panelID);
        var sizeLines = lines.size();
        
        for (var i = 0; i < sizeLines; i++)
        {
            //console.log(lines);
            var aLine = $("#" + lines[0][i].id);
            var lineID = lines[0][i].id.split("_");
            if (lineID[0] === panelID)
            {
                if (!icon)
                {
                    aLine.attr("x1", Window.getCenter(lineID[0])["x"]);
                    aLine.attr("y1", Window.getCenter(lineID[0])["y"]);
                }
                else
                {
                    aLine.attr("x1", parseInt(Window.getCenter("icon-" + lineID[0])["x"]));
                    aLine.attr("y1", parseInt(Window.getCenter("icon-" + lineID[0])["y"]));
                }
            }
            else
            {
                if (!icon)
                {
                    aLine.attr("x2", Window.getCenter(lineID[1])["x"]);
                    aLine.attr("y2", Window.getCenter(lineID[1])["y"]);
                }
                else
                {
                    aLine.attr("x2", parseInt(Window.getCenter("icon-" + lineID[1])["x"]));
                    aLine.attr("y2", parseInt(Window.getCenter("icon-" + lineID[1])["y"]));
                }
            }
        }
    }

    createNewChild(currentId, chartObj, parent, panelContent) {
        var newElem = $('<div '+ 'id="' + currentId + '" class="panel panel-default"> <div class="panel-heading clearfix"> <h4 class="panel-title pull-left" style="padding-top: 7.5px;">' + chartObj + '</h4> <button disabled class="btn btn-default btn-remove"><i class="glyphicon glyphicon-remove"></i></button> <button class="btn btn-default btn-minimize"><i class="glyphicon glyphicon-minus"></i></button> </div><div class="panel-body center-panel"></div></div>').css({"position": "absolute"});
        //var newID = "";
        var chart;
        $(".container").append(newElem);

        if(parent !== null) {
            var div = document.getElementById(parent.id);
            var rect = div.getBoundingClientRect();
            var parentWidth = div.clientWidth;
            //var parentHeight = div.clientHeight;
            //console.log(parentWidth);
            //console.log(parentHeight);

            newElem.css({'left': rect.left + parentWidth+100});
        }
        /* Sets up the panel settings as drag, resize, etc */
        this.setUpPanel(currentId);

        // Draw line
        if(this.parent != null) {
            this.drawLine();
            this.parent.addChild(this);
        }
    
        var centralPanel = $( "#" + currentId + " .panel-body.center-panel");
        if(typeof panelContent === "function") {
            panelContent(centralPanel, currentId);
        }
        else {
            panelContent.appendToPanel(centralPanel, currentId);
        }
        
        //this.callback(centralPanel, currentId);
        //console.log(centralPanel);
    }

    setUpPanel(newID) {

        var $this = this;
        /* Guarantees the right colors of btn-minimize */
        $("#"+ newID + " .btn-default.btn-minimize")
            .mouseenter(function() {
                $(this).css("background", "#e6e6e6");
            })
            .mouseleave(function() {
                $(this).css("background", "#fff");
            })
            .on("click", function() {
                $this.minimizeWindow();
            });
    
        if(this.parent != null) {
            $("#"+ newID + " .btn-default.btn-remove")
                .removeAttr("disabled")
                .on("click", function() {
                    $this.removeWindow();
                    $this.parent.removeChild(this);
                    windowClosed.windowObj = $this;
                    document.dispatchEvent(windowClosed);
                });
        }
        
            
            
        /* Getting the workspace SVG */
        var workspace = $("#workspace");
    
        //var isTimeline = newID === "panel-1-1";
    
        var initialWidth, initialHeight, minWidth, minHeight, maxWidth, maxHeight;
    
        initialWidth = this.INITIAL_WIDTH;
        initialHeight = this.INITIAL_HEIGHT;
        minWidth = this.INITIAL_WIDTH;
        minHeight = this.INITIAL_HEIGHT;
        maxWidth  = this.MAX_WIDTH;
        maxHeight = this.MAX_HEIGHT;
    
        /* Setting up the panel */
        var lightbox_resize = false;
        $( "#" + newID)
            .draggable({
                handle: ".panel-heading",
                stack: ".panel, .fa-window-maximize",
                containment: workspace,
                drag: function(){
                    Window.centerLine($this.id);
                },
                cancel: '.dropdown-menu'
            })
            .find(".panel-body")
            .css({
                height: initialHeight,
                width: initialWidth
            })
            /*.resizable({
                resize: function(){
                    //var aPanel = $(this).parents(".panel")[0];
                    if (lightbox_resize)
                        clearTimeout(lightbox_resize);
                    lightbox_resize = setTimeout(function() {
                        Window.centerLine($this.id);
                        if($this.panelContent instanceof AbstractPanelBuilder)
                            $this.panelContent.resizePanel($(this).width(), $(this).height());
                    }, 500);                
                },
                aspectRatio: true,
                maxHeight: maxHeight,
                maxWidth: maxWidth,
                minHeight: minHeight,
                minWidth: minWidth
            });*/

            $("#" + newID)
                    .find(".panel-body")
                    .wrap('<div/>')
                        .css({'overflow':'scroll'})
                        .parent()
                            .css({'display':'inline-block',
                                'overflow':'hidden',
                                'height':function(){return $('.panel-body',this).height();},
                                'width':  function(){return $('.panel-body',this).width();},
                                'paddingBottom':'12px',
                                'paddingRight':'12px'
                                
                                }).resizable({
                                    resize: function(){
                                        //var aPanel = $(this).parents(".panel")[0];
                                        if (lightbox_resize)
                                            clearTimeout(lightbox_resize);
                                        lightbox_resize = setTimeout(function() {
                                            Window.centerLine($this.id);
                                            if($this.panelContent instanceof AbstractPanelBuilder)
                                                $this.panelContent.resizePanel($(this).width(), $(this).height());
                                        }, 500);                
                                    },
                                    aspectRatio: false,
                                    maxHeight: maxHeight,
                                    maxWidth: maxWidth,
                                    minHeight: minHeight,
                                    minWidth: minWidth
                                })
                                    .find('.panel-body')
                                    .css({overflow:'auto',
                                            width:'100%',
                                            height:'100%'});
    }

    

    drawLine() {
        var svg = d3.select("#workspace");

        var centerX = Window.getCenter(this.id);
        var centerY = Window.getCenter(this.parent.id);

        // FIXME: Make an algorithm to detect the border limiting the line, because the line is draw at the center of the panel  
        svg.append("svg:defs").append("svg:marker")
            .attr("id", "triangle_"+ this.id + "_"+ this.parent.id)
            .attr("refX", 15)
            .attr("refY", -1.5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0 -5 10 10")
            .style("stroke", "black");

        var line = svg.append("line")
            .style("stroke", "black")
            .attr("id",this.id + "_"+ this.parent.id) //ex: id = "panel-1-1_panel-2-1"
            .attr("class", "class-" + this.id + " class-" + this.parent.id) //ex: class="panel-1-1 panel-2-1"
            .attr("x1", centerX["x"])
            .attr("y1", centerX["y"])
            .attr("x2", centerY["x"])
            .attr("y2", centerY["y"])
            .attr("marker-end", "url(#triangle_"+this.id + " class-" + this.parent.id +")");

        
    }

    minimizeWindow() {
        this.createNewIcon();
        Window.centerLine(this.id, true);
        $("#"+this.id).hide();
    }

    maximizeWindow(element) {
        var icon = element;
        var iconOffset = icon.offset();
        var panel = $("#"+this.id);

        var left = iconOffset.left - panel.width()/2;
        var top = iconOffset.top - panel.height()/2;

        if (left <= 10)
            left = 10;

        if (top <= 10)
            top = 10;

        panel
            .show()
            .css({
                "left" : left,
                "top"  : top
            });
        
        $("#"+ this.id + " .btn-default.btn-minimize").css("background", "#fff");

        icon.remove();

        /* Removes the dotted stylesheets of lines */
        d3.selectAll("line").filter(".class-" + this.id).style("stroke-dasharray", "");

        /* Keeps the icons with dotted line stylesheets */
        var activeIcons = $(" .fa-window-maximize");
        for (var i = 0; i < activeIcons.size(); i++)
        {
            var iconID = activeIcons[i].id.replace("icon-", "");
            d3.selectAll("line").filter(".class-" + iconID).style("stroke-dasharray", ("3, 3"));
        }
        //this.panelContent.render();
    }

    createNewIcon() {

        var $this = this;
        var panelCenter = Window.getCenter(this.id);

        var workspace = $("#workspace");

        $(".container").append(
            '<i id= "icon-' + this.id + '" class="fa fa-window-maximize fa-2x"></i>'
        );

        $("#icon-"+this.id)
            .draggable({
                stack: ".panel, .fa-window-maximize",
                containment: [10,10, workspace.width() - this.WIDTH_ICON - 10 , workspace.height() - this.HEIGHT_ICON - 10],
                drag: function(){
                    Window.centerLine($this.id, true);
                },
                stop:function(){
                    Window.centerLine($this.id, true);
                }
            })
            .css({
                "left" :  panelCenter["x"],
                "top"  :  panelCenter["y"]
            })
            .on("dblclick", function() {
                $this.maximizeWindow($(this));
            });
        
        /* Makes all the lines that are connected to a icon to become dotted */
        d3.selectAll("line").filter(".class-" + this.id).style("stroke-dasharray", ("3, 3"));
    }

    removeWindow() {
        this.children.forEach(function (child) {
            child.removeWindow();
        });
        this.removeLines();
        $("#" + this.id).remove();
        $("#icon-"+ this.id).remove();
    }

    removeLines() {
        var lines = d3.selectAll("line").filter(".class-" + this.id);
        for(var i = 0, len = lines.size(); i < len; i++) {
            $("#" + lines[0][i].id).remove();
        }
    }

    resizeWindow(width, height) {
        $( "#" + this.id)
            .find(".panel-body")
            .css({
                width: width,
                height: height
            });
    }

    addChild(window) {
        this.children.push(window);
    }

    removeChild(window) {
        var index = this.children.indexOf(window);
        if(index > -1) {
            this.children.splice(index, 1);
        }
    }

}
