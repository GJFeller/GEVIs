/*
 * Created by Rodrigo on 25/05/2017.
 */

class Window {
    constructor(id, title, parent) {
        this.id = id;
        this.title = title;
        this.parent = parent;
        /* Initial values of panel Height and Width */
        this.INITIAL_HEIGHT = 250;
        this.INITIAL_WIDTH = 350;

        /* Max values of panel Height and Width */
        this.MAX_HEIGHT = 620;
        this.MAX_WIDTH = 1000;

        /* Constant values of icon Height and Width */
        this.HEIGHT_ICON = 28;
        this.WIDTH_ICON = 28;

        this.createNewChild(id, title, parent);
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

    createNewChild(currentId, chartObj, parent) {
        var newElem = $('<div '+ 'id="' + currentId + '" class="panel panel-default"> <div class="panel-heading clearfix"> <h4 class="panel-title pull-left" style="padding-top: 7.5px;">' + chartObj + '</h4> <button disabled class="btn btn-default btn-remove"><i class="glyphicon glyphicon-remove"></i></button> <button class="btn btn-default btn-minimize"><i class="glyphicon glyphicon-minus"></i></button> </div><div class="panel-body center-panel"></div></div>').css({"position": "absolute"});
        //var newID = "";
        var chart;
        $(".container").append(newElem);

    
        /* Sets up the panel settings as drag, resize, etc */
        this.setUpPanel(currentId);

        // Draw line
        if(this.parent != null)
            this.drawLine();
    
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
            });
    
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
        $( "#" + newID)
            .draggable({
                handle: ".panel-heading",
                stack: ".panel, .fa-window-maximize",
                containment: [10,10, workspace.width() - initialWidth - 10 , 
                    workspace.height() - initialHeight - 90],
                drag: function(){
                    $this.centerLine($this.id);
                },
                cancel: '.dropdown-menu'
            })
            .find(".panel-body")
            .css({
                height: initialHeight,
                width: initialWidth
            })
            .resizable({
                resize: function(){
                    //var aPanel = $(this).parents(".panel")[0];
                    $this.centerLine($this.id);
                },
                aspectRatio: true,
                maxHeight: maxHeight,
                maxWidth: maxWidth,
                minHeight: minHeight,
                minWidth: minWidth
            });
    }

    centerLine(panelID, icon) {
        if (typeof icon === 'undefined') { icon = false; }
        var lines =  d3.selectAll("line").filter(".class-" + panelID);
        var sizeLines = lines.size();
    
        for (var i = 0; i < sizeLines; i++)
        {
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

    drawLine() {
        var svg = d3.select("#workspace");

        var centerX = Window.getCenter(this.id);
        var centerY = Window.getCenter(this.parent.id);

        var line = svg.append("line")
            .style("stroke", "black")
            .attr("id",this.id + "_"+ this.parent.id) //ex: id = "panel-1-1_panel-2-1"
            .attr("class", "class-" + this.id + " class-" + this.parent.id) //ex: class="panel-1-1 panel-2-1"
            .attr("x1", centerX["x"])
            .attr("y1", centerX["y"])
            .attr("x2", centerY["x"])
            .attr("y2", centerY["y"]);
    }

}
