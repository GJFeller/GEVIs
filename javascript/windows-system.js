/*
 * Created by Rodrigo on 25/05/2017.
 */

class Window {
    constructor(id, title, parent) {
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

    createNewChild(currentId, chartObj, parent) {
        var newElem = $('<div '+ 'id="' + currentId + '" class="panel panel-default"> <div class="panel-heading clearfix"> <h4 class="panel-title pull-left" style="padding-top: 7.5px;">' + chartObj + '</h4> <button disabled class="btn btn-default btn-remove"><i class="glyphicon glyphicon-remove"></i></button> <button class="btn btn-default btn-minimize"><i class="glyphicon glyphicon-minus"></i></button> </div><div class="panel-body center-panel"></div></div>').css({"position": "absolute"});
        //var newID = "";
        var chart;
        $(".container").append(newElem);

    
        /* Sets up the panel settings as drag, resize, etc */
        this.setUpPanel(currentId);
    
    }

    setUpPanel(newID) {
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
                    //centerLine(this.id);
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
                    //centerLine(aPanel.id);
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
                    aLine.attr("x1", getCenter(lineID[0])["x"]);
                    aLine.attr("y1", getCenter(lineID[0])["y"]);
                }
                else
                {
                    aLine.attr("x1", parseInt(getCenter("icon-" + lineID[0])["x"]));
                    aLine.attr("y1", parseInt(getCenter("icon-" + lineID[0])["y"]));
                }
            }
            else
            {
                if (!icon)
                {
                    aLine.attr("x2", getCenter(lineID[1])["x"]);
                    aLine.attr("y2", getCenter(lineID[1])["y"]);
                }
                else
                {
                    aLine.attr("x2", parseInt(getCenter("icon-" + lineID[1])["x"]));
                    aLine.attr("y2", parseInt(getCenter("icon-" + lineID[1])["y"]));
                }
            }
        }
    }

}
