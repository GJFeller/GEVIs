class SpatialVisualizationPanel extends AbstractPanelBuilder {
    constructor(data, id, window) {
        super();
        this.id = id;
        this.data = data;
        this.ensembleInfo = null;
        this.varList = [];
        this.window = window;
        this.renderInitialized = false;
        this.renderer = null;
        this.renderers = [];
        this.camera = null;
        this.scene = null;
        this.scenes = [];
        this.axisScenes = [];
        this.legendScenes = [];
        this.titleScenes = [];
        this.legends = [];
        this.axisScene = null;
        this.axisCamera = null;
        this.legendScene = null;
        this.legendCamera = null;
        this.titleCamera = null;
        this.titleScene = null;
        this.controls = null;
        this.controlsAxes = null;
        this.raycaster = null;
        this.mouse = null;
        this.line = null;
        this.cellQuantity = null;
        this.selectedCells = [];
        this.marginSize = 17;
        this.query = null;

        //this.getRemoteData();
    }

    appendToPanel(panel, id) {
        this.panel = panel;
        panel.css({'overflow': 'auto'});
        this.id = id;
        this.render();
    }

    setEnsemble(ensembleInfo) {
        this.ensembleInfo = ensembleInfo;
        this.getRemoteData();
    }

    setQuery(query) {
        this.query = query;
        this.renderInitialized = false;
        this.renderers.splice(0,this.renderers.length);
        this.scenes.splice(0,this.scenes.length);
        this.axisScenes.splice(0,this.axisScenes.length);
        this.legendScenes.splice(0,this.legendScenes.length);
        this.titleScenes.splice(0, this.titleScenes.length);
        this.getRemoteData();
    }

    setIfLogScale(isLogScale) {
        this.isLogScale = isLogScale;
        this.renderInitialized = false;
        this.renderers.splice(0,this.renderers.length);
        this.scenes.splice(0,this.scenes.length);
        this.axisScenes.splice(0,this.axisScenes.length);
        this.legendScenes.splice(0,this.legendScenes.length);
        this.titleScenes.splice(0, this.titleScenes.length);
        this.render();
    }

    isLogScale() {
        return this.isLogScale;
    }

    setVariableList(varList) {
        this.varList = varList;
        this.renderInitialized = false;
        this.renderers.splice(0,this.renderers.length);
        this.scenes.splice(0,this.scenes.length);
        this.axisScenes.splice(0,this.axisScenes.length);
        this.legendScenes.splice(0,this.legendScenes.length);
        this.titleScenes.splice(0, this.titleScenes.length);
        this.getRemoteData();
    }

    getRemoteData() {
        $('#loading').css('visibility','visible');
        var $this = this;
        if(this.data instanceof Array)
            this.data.splice(0,this.data.length);
        
        var varNameList = [];
        this.varList.forEach(function (variable, idx) {
            varNameList[idx] = variable.variable + "-" + variable.specie;
        });
        var ensembleId = this.ensembleInfo._id;
        var simulationList = [];
        // FIXME: Implement the query system to solve this problem with selectedSimulations
        //simulationList = this.ensembleInfo.simulations;
        if(this.query === null || this.query.selectedSimulations === undefined 
            || this.query.selectedSimulations.length === 0) {
            simulationList = this.ensembleInfo.simulations;
        }
        else {
            simulationList = this.query.selectedSimulations;
        }
        
        var promises = [];
        var dataList = [];
        backendConnection.getCellQuantity(ensembleId)
            .then(function(cellQty) {
                $this.cellQuantity = cellQty[0];
                console.log($this.cellQuantity);
                if($this.varList.length > 0) {
                    $('#loading').css('visibility','visible');
                    for(var i = 0; i < simulationList.length; i++) {
                        var variableStringList = $this.varList[0].id;
                        for(var j = 1; j < $this.varList.length; j++) {
                            variableStringList = variableStringList + "," + $this.varList[j].id;
                        }
                        //FIXME: Default is 0
                        promises.push(backendConnection.getSpatialData(100, simulationList[i], variableStringList));
                    }
                    Promise.all(promises)
                        .then(function(values) {
                            console.log(values);
                            dataList = values;
                            $this.data = $this.reformatDataList(dataList);
                            console.log($this.data);
                            $this.render();
                            $('#loading').css('visibility','hidden');
                        })
                        .catch(function (err) {
                            console.log("Erro ao pegar dados espaciais do servidor");
                            console.log(err);
                        });
                }
                else {
                    $this.render();
                    $('#loading').css('visibility','hidden');
                }
                
            })
            .catch(function (err) {
                console.log("Erro ao pegar a quantidade de células do servidor");
                console.error(err.message);
            });
        
    }

    reformatDataList(dataList) {
        var $this = this;
        var accumulatedCellData = [];
        dataList.forEach(function (simData, i) {
            //console.log(simData);
            simData.forEach(function (dataPoint, j) {
                var cellData = {};
                var cellInAccumulated = accumulatedCellData.filter(cell => (cell.xIdx == dataPoint.cell.xIdx) 
                                                                        && (cell.yIdx == dataPoint.cell.yIdx) 
                                                                        && (cell.zIdx == dataPoint.cell.zIdx));
                if(cellInAccumulated.length > 0) {
                    cellData = cellInAccumulated[0];
                    dataPoint.variables.forEach(function (varData) {
                        var currentVar = cellData.variableData.filter(aVar => aVar.variableId == varData.variableId);
                        if(currentVar.length > 0) {
                            currentVar[0].accumulatedData.push(varData.value);
                        } else {
                            console.log("There is something wrong");
                        }
                    });
                }
                else {
                    cellData.xIdx = dataPoint.cell.xIdx;
                    cellData.yIdx = dataPoint.cell.yIdx;
                    cellData.zIdx = dataPoint.cell.zIdx;
                    cellData.variableData = [];
                    dataPoint.variables.forEach(function (varData) {
                        var aVarData = {};
                        //console.log(varData);
                        //console.log($this.varList);
                        var varInfo = $this.varList.filter(aVar => aVar.id == varData.variableId);
                        //console.log(varInfo);
                        aVarData.variableId = varData.variableId;
                        aVarData.type = varInfo[0].type;
                        aVarData.variable = varInfo[0].variable;
                        aVarData.specie = varInfo[0].specie;
                        aVarData.unit = varInfo[0].unit;
                        aVarData.accumulatedData = [];
                        aVarData.accumulatedData.push(varData.value);
                        cellData.variableData.push(aVarData);
                    });
                    accumulatedCellData.push(cellData);
                }
                
            })
        });

        return accumulatedCellData;
    }


    render() {

        var $this = this;
        console.log($this.panel);
        //container.empty();
        this.panel.find("canvas").remove();
        $("body").find("canvas#legend").remove();
        this.panel.find("div").remove();
        
        var selectedObjects = [];
        var selectedWireframes = [];
        var selectedIndexes = [];
        var wireframe = null;
        var geometry = new THREE.Geometry();
        // initialize object to perform world/screen calculations
        var projector = new THREE.Projector();
        var colorMap = 'rainbow';
        var legendLayout = 'vertical';
        var numberOfColors = 512;
        
        
        $this.raycaster = new THREE.Raycaster();
        $this.mouse = new THREE.Vector2();

        var INTERSECTED = null;

        var sceneQty = $this.varList.length;
        console.log($this.varList.length);
        if(sceneQty <= 1) {
            sceneQty = 1;
        }

        var baseMaterial = new THREE.MeshPhongMaterial( { color: 0x915D0A, side: THREE.DoubleSide } );
        var highlightedMaterial = new THREE.LineBasicMaterial( { color: 0xCCCCCC, linewidth: 3 } );
        var wireframeMaterial = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 2 } );

        
        if(!this.renderInitialized) {
            if(this.cellQuantity !== null) {
                if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

                

                var holes = [];
                var container = $this.panel;

                init();
                animate();
                
                function init() {

                    for(var sceneIdx = 0; sceneIdx < sceneQty; sceneIdx++) {
                        
                        var cubeVertices = [
                            // front
                            new THREE.Vector3(-1.0, -1.0,  1.0),
                            new THREE.Vector3(1.0, -1.0,  1.0),
                            new THREE.Vector3(1.0,  1.0,  1.0),
                            new THREE.Vector3(-1.0,  1.0,  1.0),
                            // back
                            new THREE.Vector3(-1.0, -1.0, -1.0),
                            new THREE.Vector3(1.0, -1.0, -1.0),
                            new THREE.Vector3(1.0,  1.0, -1.0),
                            new THREE.Vector3(-1.0,  1.0, -1.0)
                        ];

                        var faces = [
                            // front
                            new THREE.Face3(0, 1, 2),
                            new THREE.Face3(2, 3, 0),
                            // top
                            new THREE.Face3(1, 5, 6),
                            new THREE.Face3(6, 2, 1),
                            // back
                            new THREE.Face3(7, 6, 5),
                            new THREE.Face3(5, 4, 7),
                            // bottom
                            new THREE.Face3(4, 0, 3),
                            new THREE.Face3(3, 7, 4),
                            // left
                            new THREE.Face3(4, 5, 1),
                            new THREE.Face3(1, 0, 4),
                            // right
                            new THREE.Face3(3, 2, 6),
                            new THREE.Face3(6, 7, 3),
                        ];

                        var uvCoord = [
                            [new THREE.Vector2(1.0, 1.0), new THREE.Vector2(0.0, 1.0), new THREE.Vector2(0.0, 0.0)],
                            [new THREE.Vector2(0.0, 0.0), new THREE.Vector2(1.0, 0.0), new THREE.Vector2(1.0, 1.0)],
                            [new THREE.Vector2(1.0, 1.0), new THREE.Vector2(0.0, 1.0), new THREE.Vector2(0.0, 0.0)],
                            [new THREE.Vector2(0.0, 0.0), new THREE.Vector2(1.0, 0.0), new THREE.Vector2(1.0, 1.0)],
                            [new THREE.Vector2(1.0, 1.0), new THREE.Vector2(0.0, 1.0), new THREE.Vector2(0.0, 0.0)],
                            [new THREE.Vector2(0.0, 0.0), new THREE.Vector2(1.0, 0.0), new THREE.Vector2(1.0, 1.0)],
                            [new THREE.Vector2(1.0, 1.0), new THREE.Vector2(0.0, 1.0), new THREE.Vector2(0.0, 0.0)],
                            [new THREE.Vector2(0.0, 0.0), new THREE.Vector2(1.0, 0.0), new THREE.Vector2(1.0, 1.0)],
                            [new THREE.Vector2(1.0, 1.0), new THREE.Vector2(0.0, 1.0), new THREE.Vector2(0.0, 0.0)],
                            [new THREE.Vector2(0.0, 0.0), new THREE.Vector2(1.0, 0.0), new THREE.Vector2(1.0, 1.0)],
                            [new THREE.Vector2(1.0, 1.0), new THREE.Vector2(0.0, 1.0), new THREE.Vector2(0.0, 0.0)],
                            [new THREE.Vector2(0.0, 0.0), new THREE.Vector2(1.0, 0.0), new THREE.Vector2(1.0, 1.0)]
                        ];

                        geometry.vertices = cubeVertices;
                        geometry.faces = faces;
                        geometry.computeFaceNormals();

                        geometry.faceVertexUvs[0] = uvCoord;
                        geometry.uvsNeedUpdate = true;

                        geometry.computeBoundingSphere();

                        var geo = new THREE.EdgesGeometry( geometry ); // or WireframeGeometry( geometry )

                        var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 3 } );

                        var wireframe = new THREE.LineSegments( geo, mat );

                        var objects = [];
                        var wireframes = [];

                        /*var d3Renderer = new THREE.CSS3DRenderer();
                        d3Renderer.domElement.id = "spatial-legend-" + sceneIdx;
                        d3Renderer.domElement.style.position = "absolute";
                        d3Renderer.domElement.style.bottom = "5px";
                        d3Renderer.domElement.style.right = "10px";*/

                        var renderer = new THREE.WebGLRenderer( { antialias: true } );
                        renderer.setPixelRatio( window.devicePixelRatio );
                        renderer.autoClear = false;
                        renderer.userData = {};
                        renderer.domElement.id = sceneIdx;

                        var div = document.createElement("div");
                        div.style.position = "relative";

                        var legendDiv = document.createElement("div");
                        legendDiv.id = "spatial-legend-" + sceneIdx;
                        legendDiv.style.position = "absolute";
                        legendDiv.style.bottom = "5px";
                        legendDiv.style.right = "10px";
                        
                        div.append(renderer.domElement);
                        div.append(legendDiv);
                        container.append(div);

                        

                        for(var i = 0; i < $this.cellQuantity; i++) {
                            var object = new THREE.Mesh( geometry, baseMaterial );
                            object.position.set(2*($this.cellQuantity/2 - i - 0.5), 0, 0 );
                            //$this.scene.add(object);
                            objects.push(object);

                            
                            var cellWireframe = new THREE.LineSegments(geo, wireframeMaterial);
                            cellWireframe.position.set(2*($this.cellQuantity/2 - i - 0.5), 0, 0 )
                            //$this.scene.add(cellWireframe);
                            wireframes.push(cellWireframe);

                        }

                        var camera = new THREE.PerspectiveCamera( 50, (container.width()-$this.marginSize) / (container.height()-$this.marginSize), 1, 2000 );
                        camera.position.x = 0;
                        camera.position.y = 0;
                        camera.position.z = $this.cellQuantity*3 + 2;

                        var axisCamera = new THREE.PerspectiveCamera( 50, 1, 1, 2000 );
                        axisCamera.position.x = 0;
                        axisCamera.position.y = 0;
                        axisCamera.position.z = 5;

                        var legendCamera = new THREE.PerspectiveCamera( 50, 1, 1, 2000 );
                        legendCamera.position.x = 0;
                        legendCamera.position.y = 0;
                        legendCamera.position.z = 5;

                        var titleCamera = new THREE.PerspectiveCamera(50, 1, 1, 2000);
                        titleCamera.position.x = 0;
                        titleCamera.position.y = 0;
                        titleCamera.position.z = 5;

                        var scene = new THREE.Scene();
                        scene.background = new THREE.Color(0x59B0E8);
                        var axisScene = new THREE.Scene();
                        var legendScene = new THREE.Scene();
                        var titleScene = new THREE.Scene();

                        var ambientLight = new THREE.AmbientLight( 0x111111);
                        scene.add( ambientLight );
                        axisScene.add(ambientLight);
                        legendScene.add(ambientLight);
                        titleScene.add(ambientLight);

                        var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
                        var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );

                        directionalLight.position.x = 0;
                        directionalLight.position.y = 1;
                        directionalLight.position.z = 0;
                        directionalLight.position.normalize();
                        camera.add( directionalLight );
                        scene.add( camera );
                        axisScene.add(axisCamera);
                        legendScene.add(legendCamera);
                        titleScene.add(titleCamera);
                        camera.lookAt( scene.position );   
                        axisCamera.lookAt(axisScene.position); 
                        legendCamera.lookAt(0, 0, 0);
                        titleCamera.lookAt(0, 0, 0);

                        scene.userData.camera = camera;
                        axisScene.userData.camera = axisCamera;
                        legendScene.userData.camera = legendCamera;
                        titleScene.userData.camera = titleCamera;
                        scene.userData.objects = [];
                        scene.userData.wireframes = [];
                        scene.userData.wireframe = wireframe;


                        var accumulatedVarValues = [];
                        var lut = new THREE.Lut( colorMap, numberOfColors );
                        var legend = [];
                        if($this.varList.length > 0) {
                            var currentVar = $this.varList[sceneIdx];
                            console.log(currentVar);

                            var varText = currentVar.variable + "-" + currentVar.specie;
                            var sprite = new THREE.TextSprite({
                                textSize: 0.35,
                                material: {
                                    color: 0x000000
                                },
                                texture: {
                                    text: varText,
                                    fontFamily: 'Arial, Helvetica, sans-serif'
                                }
                            });
                            sprite.position.set(0, 1, 0);
                            titleScene.add(sprite);
                            
                            console.log($this.data);
                            $this.data.forEach(function (cell) {
                                var varDataInCell = cell.variableData.filter(aVar => aVar.variableId == currentVar.id);
                                //console.log(varDataInCell);
                                //accumulatedVarValues.push(varDataInCell[0].accumulatedData);
                                accumulatedVarValues = [].concat.apply(accumulatedVarValues, varDataInCell[0].accumulatedData);
                            });

                            //console.log(accumulatedVarValues);
                            var extent = d3.extent(accumulatedVarValues, function(d){ return d; });
                            console.log(extent);

                            //Test purpose
                            lut.setMax( extent[1] );
                            lut.setMin( extent[0] );
                            
                            
                            // Legend
                            /*legend = lut.setLegendOn({'layout': legendLayout, 'position': {'x': 0, 'y': 0, 'z' : 0}});
                            var labels = lut.setLegendLabels({'title': '', 'um': currentVar.unit, 'ticks': 5, 'fontsize': 50});
                            legendScene.add( legend );
                            legendScene.add ( labels['title'] );

                            for ( var i = 0; i < Object.keys( labels[ 'ticks' ] ).length; i++ ) {
                                legendScene.add ( labels[ 'ticks' ][ i ] );
                                legendScene.add ( labels[ 'lines' ][ i ] );
                            }*/
                            createLegend();
                            function createLegend() {


                                var percentWidth = container.width()*0.50;
                                var percentHeight = container.height()*0.50;
                                var legendRect = {left: container.width()-percentWidth, right: container.width()-$this.marginSize, top: container.height()-percentHeight, bottom: container.height()-$this.marginSize};
                                var fullWidth  = legendRect.right - legendRect.left;
                                var fullHeight = legendRect.bottom - legendRect.top;
                                var left   = legendRect.left;
                                var top    = legendRect.top;

                                var legendMargin = {top: 20, right: 20, bottom: 20, left: 20};
                                var width = fullWidth - legendMargin.left - legendMargin.right;
                                var height = fullHeight - legendMargin.top - legendMargin.bottom;


                                var legendSvg = d3.select('#spatial-legend-' + sceneIdx)
                                    .append("svg")
                                    .attr('width', fullWidth)
                                    .attr('height', fullHeight)
                                    .style('vertical-align', 'top')
                                    .append('g')
                                    .attr('transform', 'translate(' + legendMargin.left + ',' +
                                    legendMargin.top + ')');


                                

                                var scale = ['#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#e6f598', '#abdda4', '#66c2a5', '#3288bd'];
                                var colorScale = d3.scale.linear()
                                    .domain(linspace(extent[0], extent[1], scale.length))
                                    .range(scale);

                                // clear current legend
                                //legendSvg.selectAll('*').remove();
                                // append gradient bar
                                var gradient = legendSvg.append('defs')
                                    .append('linearGradient')
                                    .attr('id', 'gradient')
                                    .attr('x1', '0%') // bottom
                                    .attr('y1', '100%')
                                    .attr('x2', '0%') // to top
                                    .attr('y2', '0%')
                                    .attr('spreadMethod', 'pad');

                                // programatically generate the gradient for the legend
                                // this creates an array of [pct, colour] pairs as stop
                                // values for legend
                                var pct = linspace(0, 100, scale.length).map(function(d) {
                                    return Math.round(d) + '%';
                                });

                                var colourPct = d3.zip(pct, scale);

                                colourPct.forEach(function(d) {
                                    gradient.append('stop')
                                        .attr('offset', d[0])
                                        .attr('stop-color', d[1])
                                        .attr('stop-opacity', 1);
                                });

                                legendSvg.append('rect')
                                    .attr('x1', 0)
                                    .attr('y1', 0)
                                    .attr('width', width*0.1)
                                    .attr('height', height)
                                    .style('fill', 'url(#gradient)');

                                // create a scale and axis for the legend
                                var legendScale = d3.scale.linear()
                                    .domain(extent)
                                    .range([height, 0]);

                                var legendAxis = d3.svg.axis()
                                    .scale(legendScale)
                                    .orient("right")
                                    .ticks(5);

                                legendSvg.append("g")
                                    .attr("class", "legendAxis")
                                    .attr("transform", "translate(" + width*0.1 + ", 0)")
                                    .call(legendAxis);

                                function linspace(start, end, n) {
                                    var out = [];
                                    var delta = (end - start) / (n - 1);
                                
                                    var i = 0;
                                    while(i < (n - 1)) {
                                        out.push(start + (i * delta));
                                        i++;
                                    }
                                
                                    out.push(end);
                                    return out;
                                }

                                /*//The maximum radius the hexagons can have to still fit the screen
                                var hexRadius = d3.min([width/(Math.sqrt(3)*MapColumns), height/(MapRows*1.5)]);

                                console.log(d3.select('#spatial-legend-' + sceneIdx));
                                var svg = d3.select('#spatial-legend-' + sceneIdx)
                                        .append("svg")
                                            .attr("width", width)
                                            .attr("height", height)
                                        .append("g");
                                var defs = svg.append("defs");
                                ///////////////////////////////////////////////////////////////////////////
                                //////////////// Calculate hexagon centers and put into array /////////////
                                ///////////////////////////////////////////////////////////////////////////	

                                var SQRT3 = Math.sqrt(3),
                                hexWidth = SQRT3 * hexRadius,
                                hexHeight = 2 * hexRadius;
                                var hexagonPoly = [[0,-1],[SQRT3/2,0.5],[0,1],[-SQRT3/2,0.5],[-SQRT3/2,-0.5],[0,-1],[SQRT3/2,-0.5]];
                                var hexagonPath = "m" + hexagonPoly.map(function(p){ return [p[0]*hexRadius, p[1]*hexRadius].join(','); }).join('l') + "z";

                                var points = [];
                                for (var i = 0; i < MapRows; i++) {
                                    for (var j = 0; j < MapColumns; j++) {
                                        var a;
                                        var b = (3 * i) * hexRadius / 2;
                                        if (i % 2 === 0) {
                                            a = SQRT3 * j * hexRadius;
                                        } else {
                                            a = SQRT3 * (j - 0.5) * hexRadius;
                                        }//else
                                        points.push({x: a, y: b});
                                    }//for j
                                }//for i

                                ///////////////////////////////////////////////////////////////////////////
                                //////////// Get continuous color scale for the Rainbow ///////////////////
                                ///////////////////////////////////////////////////////////////////////////

                                var coloursRainbow = ["#2c7bb6", "#00a6ca","#00ccbc","#90eb9d","#ffff8c","#f9d057","#f29e2e","#e76818","#d7191c"];
                                var colourRangeRainbow = d3.range(0, 1, 1.0 / (coloursRainbow.length - 1));
                                colourRangeRainbow.push(1);
                                        
                                //Create color gradient
                                var colorScaleRainbow = d3.scale.linear()
                                    .domain(colourRangeRainbow)
                                    .range(coloursRainbow)
                                    .interpolate(d3.interpolateHcl);

                                //Needed to map the values of the dataset to the color scale
                                var colorInterpolateRainbow = d3.scale.linear()
                                    .domain(extent)
                                    .range([0,1]);

                                ///////////////////////////////////////////////////////////////////////////
                                //////////////////// Create the Rainbow color gradient ////////////////////
                                ///////////////////////////////////////////////////////////////////////////

                                //Calculate the gradient	
                                defs.append("linearGradient")
                                    .attr("id", "gradient-rainbow-colors")
                                    .attr("x1", "0%").attr("y1", "0%")
                                    .attr("x2", "100%").attr("y2", "0%")
                                    .selectAll("stop") 
                                    .data(coloursRainbow)                  
                                    .enter().append("stop") 
                                    .attr("offset", function(d,i) { return i/(coloursRainbow.length-1); })   
                                    .attr("stop-color", function(d) { return d; });

                                ///////////////////////////////////////////////////////////////////////////
                                ////////////////////////// Draw the legend ////////////////////////////////
                                ///////////////////////////////////////////////////////////////////////////

                                var legendWidth = width * 0.6,
                                    legendHeight = 10;

                                //Color Legend container
                                var legendsvg = svg.append("g")
                                    .attr("class", "legendWrapper")
                                    .attr("transform", "translate(" + (width/2 - 10) + "," + (height/2) + ")");

                                //Draw the Rectangle
                                legendsvg.append("rect")
                                    .attr("class", "legendRect")
                                    .attr("x", -legendWidth/2)
                                    .attr("y", 10)
                                    //.attr("rx", legendHeight/2)
                                    .attr("width", legendWidth)
                                    .attr("height", legendHeight)
                                    .style("fill", "none");

                                //Append title
                                legendsvg.append("text")
                                    .attr("class", "legendTitle")
                                    .attr("x", 0)
                                    .attr("y", -2)
                                    .text("Store Competition Index");

                                //Set scale for x-axis
                                var xScale = d3.scale.linear()
                                    .range([0, legendWidth])
                                    .domain([extent[0],extent[1]]);
                                    //.domain([d3.min(pt.legendSOM.colorData)/100, d3.max(pt.legendSOM.colorData)/100]);

                                //Define x-axis
                                var xAxis = d3.svg.axis()
                                    .orient("bottom")
                                    .ticks(5)  //Set rough # of ticks
                                    //.tickFormat(formatPercent)
                                    .scale(xScale);

                                //Set up X axis
                                legendsvg.append("g")
                                    .attr("class", "legendAxis")  //Assign "axis" class
                                    .attr("transform", "translate(" + (-legendWidth/2) + "," + (10 + legendHeight) + ")")
                                    .call(xAxis);*/

                            }
                            //var element = document.createElement('div');
                            //element.innerHTML = ''; 
                            //element.style.background = "#0094ff";
                            //element.style.fontSize = "2em";
                            //element.style.color = "white";
                            //element.style.padding = "2em";

                            //CSS Object
                            /*var objdiv = new THREE.CSS3DObject(element);
                            objdiv.position.x = 0;
                            objdiv.position.y = 0;
                            objdiv.position.z = 0;
                            legendScene.add(objdiv);*/

                        }

                        //console.log(accumulatedVarValues);                     

                        for(var i = 0; i < $this.cellQuantity; i++) {
                            //var varDataInCell = $this.data[i].variableData.filter(aVar => aVar.variableId == currentVar.id);

                            //console.log(objects[i]);
                            var aObject = objects[i].clone();
                            if($this.varList.length > 0) {
                                var varDataInCell = $this.data[i].variableData.filter(aVar => aVar.variableId == currentVar.id);
                                //accumulatedVarValues = [].concat(varDataInCell[0].accumulatedData);
                                console.log(varDataInCell[0].accumulatedData);
                                var mean = d3.mean(varDataInCell[0].accumulatedData, function(d){ return d; });
                                var newMaterial = new THREE.MeshPhongMaterial( { color: lut.getColor(mean), side: THREE.DoubleSide } );
                                //aObject.material.color = lut.getColor(mean);
                                aObject.material = newMaterial;
                            }
                            scene.add(aObject);
                            scene.userData.objects.push(aObject);
                            var aWireframe = Object.assign(wireframes[i]);
                            var invIdx = $this.cellQuantity - 1 - i;
                            if($this.selectedCells.indexOf(invIdx) >= 0)
                                aWireframe.material = highlightedMaterial;
                            scene.add(aWireframe);
                            scene.userData.wireframes.push(aWireframe);
                        }

                        var dir = new THREE.Vector3( 1, 0, 0 );

                        //normalize the direction vector (convert to vector of length 1)
                        dir.normalize();

                        var origin = new THREE.Vector3( 2*($this.cellQuantity/2 - $this.cellQuantity - 2), 0, 0 );
                        var length = 2.5;
                        var hex = 0x0000ff;

                        var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
                        arrowHelper.setLength(length, 1, 0.75)
                        scene.add( arrowHelper );

                        // Axes Helper
                        var axis = new THREE.AxesHelper(1.5);
                        axisScene.add(axis);
                        var axisLabelSize = 0.7;
                        var xsprite = new THREE.TextSprite({
                            textSize: axisLabelSize,
                            material: {
                                color: 0x000000
                            },
                            texture: {
                                text: 'x',
                                fontFamily: 'Arial, Helvetica, sans-serif'
                            }
                        });
                        xsprite.position.set(2, 0, 0);
                        var ysprite = new THREE.TextSprite({
                            textSize: axisLabelSize,
                            material: {
                                color: 0x000000
                            },
                            texture: {
                                text: 'y',
                                fontFamily: 'Arial, Helvetica, sans-serif'
                            }
                        });
                        ysprite.position.set(0, 2, 0);
                        var zsprite = new THREE.TextSprite({
                            textSize: axisLabelSize,
                            material: {
                                color: 0x000000
                            },
                            texture: {
                                text: 'z',
                                fontFamily: 'Arial, Helvetica, sans-serif'
                            }
                        });
                        zsprite.position.set(0, 0, 2);
                        axisScene.add(xsprite);
                        axisScene.add(ysprite);
                        axisScene.add(zsprite);
                        

                        $this.scenes.push(scene);
                        $this.axisScenes.push(axisScene);
                        $this.legendScenes.push(legendScene);
                        $this.titleScenes.push(titleScene);

                        

                        //container.append(renderer.domElement);
                        //console.log(canvas[0]);

                        renderer.domElement.addEventListener('mousemove', onMouseMove, false);
                        renderer.domElement.addEventListener('mousedown', onMouseDown, false);
                        //renderer.userData.canvas = canvas[0];

                        var controls = new THREE.OrbitControls( camera, renderer.domElement );
                        var controlsAxes = new THREE.OrbitControls( axisCamera, renderer.domElement );
                        controlsAxes.enableZoom = false;
                        renderer.userData.controls = controls;
                        renderer.userData.controlsAxes = controlsAxes;
                        //renderer.userData.legendRenderer = d3Renderer;

                        $this.renderers.push(renderer);


                    }

                    console.log($this.scenes);

                    $this.renderInitialized = true;

                }

                function onWindowResize() {

                    $this.camera.aspect = container.width() / container.height();
                    $this.camera.updateProjectionMatrix();

                    $this.renderer.setSize( container.width(), container.height() );

                }

                function onMouseMove(event) {
                    event.preventDefault();
                    //console.log(event);

                    var idx = parseInt(event.target.id);
                    // update the mouse variable
                    var rect = event.target.getBoundingClientRect();
                    //console.log(rect);
                    $this.mouse.x = ( (event.clientX - rect.left) / (container.width()-$this.marginSize) ) * 2 - 1;
                    $this.mouse.y = - ( (event.clientY - rect.top) / (container.height()-$this.marginSize) ) * 2 + 1;

                    // find intersections

                    // create a Ray with origin at the mouse position
                    //   and direction into the scene (camera direction)
                    var vector = new THREE.Vector3( $this.mouse.x, $this.mouse.y, 1 );
                    projector.vector = vector;
                    projector.vector.unproject( $this.scenes[idx].userData.camera );
                    var ray = new THREE.Raycaster( $this.scenes[idx].userData.camera.position, vector.sub( $this.scenes[idx].userData.camera.position ).normalize() );
                    console.log(idx);
                    // create an array containing all objects in the scene with which the ray intersects
                    var intersects = ray.intersectObjects( $this.scenes[idx].userData.objects );
        
                    // if there is one (or more) intersections
                    if ( intersects.length > 0 )
                    {
                        if(INTERSECTED==null) {
                            INTERSECTED = intersects[ 0 ];
                            console.log(INTERSECTED);
                            if(wireframe !== null) {
                                $this.scenes[idx].userData.wireframe.position.set(INTERSECTED.object.position.x, INTERSECTED.object.position.y, INTERSECTED.object.position.z);
                                $this.scenes[idx].add( $this.scenes[idx].userData.wireframe );
                            }
                        }
                        else {
                            $this.scenes[idx].remove( $this.scenes[idx].userData.wireframe );
                            INTERSECTED = intersects[ 0 ];
                            $this.scenes[idx].userData.wireframe.position.set(INTERSECTED.object.position.x, INTERSECTED.object.position.y, INTERSECTED.object.position.z);
                            $this.scenes[idx].add( $this.scenes[idx].userData.wireframe );	
                        }
                    }
                    else {
                        if(INTERSECTED) {
                            $this.scenes[idx].remove($this.scenes[idx].userData.wireframe);
                        }
                        INTERSECTED = null;
                    }
                }

                function onMouseDown(event) {
                    event.preventDefault();
                    console.log(event);

                    var idx = parseInt(event.target.id);
                    // update the mouse variable
                    var rect = event.target.getBoundingClientRect();
                    $this.mouse.x = ( (event.clientX - rect.left) / (container.width()-$this.marginSize) ) * 2 - 1;
                    $this.mouse.y = - ( (event.clientY - rect.top) / (container.height()-$this.marginSize) ) * 2 + 1;

                    // find intersections

                    // create a Ray with origin at the mouse position
                    //   and direction into the scene (camera direction)
                    var vector = new THREE.Vector3( $this.mouse.x, $this.mouse.y, 1 );
                    projector.vector = vector;
                    projector.vector.unproject( $this.scenes[idx].userData.camera );
                    var ray = new THREE.Raycaster( $this.scenes[idx].userData.camera.position, vector.sub( $this.scenes[idx].userData.camera.position ).normalize() );
                    console.log(idx);
                    // create an array containing all objects in the scene with which the ray intersects
                    var intersects = ray.intersectObjects( $this.scenes[idx].userData.objects );

                    // if there is one (or more) intersections
                    if ( intersects.length > 0 )
                    {
                        var obj = intersects[ 0 ].object;
                        var objIdx = $this.scenes[idx].userData.objects.indexOf(obj);
                        var objInvIdx = $this.cellQuantity - 1 - objIdx;
                        var sIdx = $this.selectedCells.indexOf(objInvIdx);
                        if(sIdx < 0) {
                            for(var i = 0; i < $this.scenes.length; i++) {
                                $this.scenes[i].userData.wireframes[objIdx].material = highlightedMaterial;
                            }
                            $this.selectedCells.push(objInvIdx);
                        }
                        else {
                            for(var i = 0; i < $this.scenes.length; i++) {
                                $this.scenes[i].userData.wireframes[objIdx].material = wireframeMaterial;
                            }
                            $this.selectedCells.splice(sIdx, 1);
                        }
                        console.log($this.selectedCells);
                        changedCellSelectionEvent.selectedCells = $this.selectedCells;
                        changedCellSelectionEvent.ensemble = $this.ensembleInfo;
                        document.dispatchEvent(changedCellSelectionEvent);

                    }
                    
                }

                //

                function animate() {

                    requestAnimationFrame( animate );

                    render();
                    //$this.controls.update();

                }

                function render() {

                    for(var i = 0; i < $this.renderers.length; i++) {
                        var renderer = $this.renderers[i];
                        //console.log($this.scenes);
                        renderer.setSize( container.width()-$this.marginSize, container.height()-$this.marginSize );
                        renderer.setViewport( 0, 0, container.width()-$this.marginSize, container.height()-$this.marginSize );
                        renderer.render($this.scenes[i], $this.scenes[i].userData.camera);

                        renderer.clearDepth();
                        var percentWidth = container.width()*0.25;
                        var percentHeight = container.height()*0.25;
                        var axesRect = {left: 0, right: percentWidth, bottom: container.height()-$this.marginSize, top: container.height()-percentHeight};
                        // set the viewport
					    var width  = axesRect.right - axesRect.left;
					    var height = axesRect.bottom - axesRect.top;
					    var left   = axesRect.left;
                        var top    = axesRect.top;
                        renderer.setViewport(left, top, width, height);
                        renderer.render($this.axisScenes[i], $this.axisScenes[i].userData.camera);

                        renderer.clearDepth();
                        /*var legendRenderer = renderer.userData.legendRenderer;
                        var percentWidth = container.width()*0.50;
                        var percentHeight = container.height()*0.50;
                        var legendRect = {left: container.width()-percentWidth, right: container.width()-$this.marginSize, top: container.height()-percentHeight, bottom: container.height()-$this.marginSize};
                        var width  = legendRect.right - legendRect.left;
					    var height = legendRect.bottom - legendRect.top;
					    var left   = legendRect.left;
                        var top    = legendRect.top;
                        legendRenderer.setSize( width, height );
                        legendRenderer.render( $this.legendScenes[i], $this.legendScenes[i].userData.camera);*/

                        //legendRenderer.clearDepth();
                        var percentWidth = container.width()*0.1;
                        var percentHeight = container.height()/2;
                        //console.log($this.titleScenes);
                        var titleRect = {left: percentWidth, right: container.width()-$this.marginSize-percentWidth, top: 0, bottom: percentHeight};
                        var width  = titleRect.right - titleRect.left;
					    var height = titleRect.bottom - titleRect.top;
					    var left   = titleRect.left;
                        var top    = titleRect.top;
                        renderer.setViewport( left, top, width, height );
                        renderer.render( $this.titleScenes[i], $this.titleScenes[i].userData.camera);

                    }
                    /*$this.renderer.clear();
                    $this.renderer.setSize( container.width(), container.height() );
                    $this.renderer.setViewport( 0, 0, container.width(), container.height() );
                    $this.renderer.render( $this.scene, $this.camera );

                    $this.renderer.clearDepth();
                    var axesRect = {left: 0, right: 100, bottom: container.height(), top: container.height()-100};
                    // set the viewport
					var width  = axesRect.right - axesRect.left;
					var height = axesRect.bottom - axesRect.top;
					var left   = axesRect.left;
                    var top    = axesRect.top;
                    $this.renderer.setViewport( left, top, width, height );
                    $this.renderer.render( $this.axisScene, $this.axisCamera );

                    $this.renderer.clearDepth();
                    var legendRect = {left: container.width()-150, right: container.width(), top: 0, bottom: 150};
                    var width  = legendRect.right - legendRect.left;
					var height = legendRect.bottom - legendRect.top;
					var left   = legendRect.left;
                    var top    = legendRect.top;
                    $this.renderer.setViewport( left, top, width, height );
                    $this.renderer.render( $this.legendScene, $this.legendCamera );*/

                }
            }
        }
    }

    resizePanel(width, height) {
        //this.camera.aspect = this.panel.width() / this.panel.height();
        //this.camera.updateProjectionMatrix();

        //this.axisCamera.updateProjectionMatrix();

        //this.renderer.setSize( this.panel.width(), this.panel.height() );
        //this.render();
    }

    setWindow(window) {
        this.window = window;
    }
}