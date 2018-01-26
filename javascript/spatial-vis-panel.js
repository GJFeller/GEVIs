class SpatialVisualizationPanel extends AbstractPanelBuilder {
    constructor(data, id, window) {
        super();
        this.id = id;
        this.data = data;
        this.varList = [];
        this.window = window;
        this.renderInitialized = false;
        this.renderer = null;
        this.camera = null;
        this.scene = null;
        this.scenes = [];
        this.axisScene = null;
        this.axisCamera = null;
        this.legendScene = null;
        this.legendCamera = null;
        this.controls = null;
        this.controlsAxes = null;
        this.raycaster = null;
        this.mouse = null;
        this.line = null;
        this.cellQuantity = null;
        this.selectedCells = [];

        this.getRemoteData();
    }

    appendToPanel(panel, id) {
        this.panel = panel;
        panel.css({'overflow': 'hidden'});
        this.id = id;
        this.render();
    }

    setVariableList(varList) {
        this.varList = varList;
        this.renderInitialized = false;
        //this.scenes.splice(0,this.scenes.length);
        this.getRemoteData();
    }

    getRemoteData() {
        var $this = this;
        if(this.data instanceof Array)
            this.data.splice(0,this.data.length);
        
        var varNameList = [];
        this.varList.forEach(function (variable, idx) {
            varNameList[idx] = variable.variable + "-" + variable.specie;
        });
        var ensembleId = selectVariablesPanel.getEnsembleList()[0]._id;
        var simulationList = selectVariablesPanel.getEnsembleList()[0].simulations;
        
        var promises = [];
        backendConnection.getCellQuantity(ensembleId)
            .then(function(cellQty) {
                $this.cellQuantity = cellQty[0];
                console.log($this.cellQuantity);
                if($this.varList.length > 0) {
                    for(var i = 0; i < simulationList.length; i++) {
                        var variableStringList = $this.varList[0].id;
                        for(var j = 1; j < $this.varList.length; j++) {
                            variableStringList = variableStringList + "," + $this.varList[j].id;
                        }
                        promises.push(backendConnection.getSpatialData(0, simulationList[i], variableStringList));
                    }
                    Promise.all(promises)
                        .then(function(values) {
                            console.log(values);
                        })
                        .catch(function () {
                        });
                }
                $this.render();
            })
        
    }

    /*getRemoteData() {
        var $this = this;
        if(this.data instanceof Array)
            this.data.splice(0,this.data.length);

        var ensembleId = selectVariablesPanel.getEnsembleList()[0]._id;
        var promises = [];
        promises.push(backendConnection.getCellQuantity(ensembleId));
        Promise.all(promises)
            .then(function(values) {
                $this.cellQuantity = values[0];
                console.log($this.cellQuantity);
                $this.render();
            })
            .catch(function () {
            });

    }*/

    render() {

        var $this = this;
        console.log($this.panel);
        this.panel.find("canvas").remove();
        var objects = [];
        var wireframes = [];
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
        var lut = new THREE.Lut( colorMap, numberOfColors );
        

        //Test purpose
		lut.setMax( 2000 );
        lut.setMin( 0 );
        
        var legend = lut.setLegendOn();
        

        var INTERSECTED = null;
        /*var baseMap = new THREE.TextureLoader().load( '../texture/text.jpg' );
        baseMap.wrapS = baseMap.wrapT = THREE.RepeatWrapping;
        baseMap.anisotropy = 16;
        var baseMaterial = new THREE.MeshPhongMaterial( { map: baseMap, side: THREE.DoubleSide } );

        var highlightedMap = new THREE.TextureLoader().load( '../texture/textSelected.jpg' );
        highlightedMap.wrapS = highlightedMap.wrapT = THREE.RepeatWrapping;
        highlightedMap.anisotropy = 16;
        var highlightedMaterial = new THREE.MeshPhongMaterial( { map: highlightedMap, side: THREE.DoubleSide } );*/
        var baseMaterial = new THREE.MeshPhongMaterial( { color: 0x915D0A, side: THREE.DoubleSide } );
        var highlightedMaterial = new THREE.LineBasicMaterial( { color: 0xCCCCCC, linewidth: 2 } );
        var wireframeMaterial = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 1 } );
        if(!this.renderInitialized) {
            if(this.cellQuantity !== null) {
                if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

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

                var holes = [];
                var container = $this.panel;

                init();
                animate();
                
                function init() {
            
                    console.log(container.width());
                    $this.camera = new THREE.PerspectiveCamera( 50, container.width() / container.height(), 1, 2000 );
                    $this.camera.position.x = 0;
                    $this.camera.position.y = 0;
                    $this.camera.position.z = $this.cellQuantity*3 + 2;

                    $this.axisCamera = new THREE.PerspectiveCamera( 50, 1, 1, 2000 );
                    $this.axisCamera.position.x = 0;
                    $this.axisCamera.position.y = 0;
                    $this.axisCamera.position.z = 5;

                    $this.legendCamera = new THREE.PerspectiveCamera( 50, 1, 1, 2000 );
                    $this.legendCamera.position.x = 0;
                    $this.legendCamera.position.y = 0;
                    $this.legendCamera.position.z = 5;
                    

                    $this.scene = new THREE.Scene();
                    $this.scene.background = new THREE.Color(0x59B0E8);
                    $this.axisScene = new THREE.Scene();
                    $this.legendScene = new THREE.Scene();

                    var light, object;

                    var ambientLight = new THREE.AmbientLight( 0x111111);
                    $this.scene.add( ambientLight );
                    $this.axisScene.add(ambientLight);
                    $this.legendScene.add(ambientLight);

                    var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
                    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );

				    directionalLight.position.x = 0;
				    directionalLight.position.y = 1;
				    directionalLight.position.z = 0;
				    directionalLight.position.normalize();
                    $this.camera.add( directionalLight );
                    $this.scene.add( $this.camera );
                    $this.axisScene.add($this.axisCamera);
                    $this.legendScene.add($this.legendCamera);
                    $this.camera.lookAt( $this.scene.position );   
                    $this.axisCamera.lookAt($this.axisScene.position); 
                    $this.legendCamera.lookAt(0, 0, 0);           

                    geometry.vertices = cubeVertices;
                    geometry.faces = faces;
                    geometry.computeFaceNormals();

                    geometry.faceVertexUvs[0] = uvCoord;
                    geometry.uvsNeedUpdate = true;

                    geometry.computeBoundingSphere();


                    var geo = new THREE.EdgesGeometry( geometry ); // or WireframeGeometry( geometry )

                    for(var i = 0; i < $this.cellQuantity; i++) {
                        object = new THREE.Mesh( geometry, baseMaterial );
                        object.position.set(2*($this.cellQuantity/2 - i - 0.5), 0, 0 );
                        $this.scene.add(object);
                        objects.push(object);

                        
                        var cellWireframe = new THREE.LineSegments(geo, wireframeMaterial);
                        cellWireframe.position.set(2*($this.cellQuantity/2 - i - 0.5), 0, 0 )
                        $this.scene.add(cellWireframe);
                        wireframes.push(cellWireframe);

                    }

                    
                    
                    
                    var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 3 } );

                    wireframe = new THREE.LineSegments( geo, mat );
				    

                    var dir = new THREE.Vector3( 1, 0, 0 );

                    //normalize the direction vector (convert to vector of length 1)
                    dir.normalize();

                    var origin = new THREE.Vector3( 2*($this.cellQuantity/2 - $this.cellQuantity - 2), 0, 0 );
                    var length = 2.5;
                    var hex = 0x0000ff;

                    var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
                    arrowHelper.setLength(length, 1, 0.75)
                    $this.scene.add( arrowHelper );

                    // Axes Helper
                    var axis = new THREE.AxesHelper(2);
                    $this.axisScene.add(axis);
                   
                    // Legend
                    legend = lut.setLegendOn({'layout': legendLayout, 'position': {'x': 0, 'y': 0, 'z' : 0}});
                    var labels = lut.setLegendLabels({'title': 'Test', 'um': 'hue', 'ticks': 5, 'fontsize': 45});
                    $this.legendScene.add( legend );
                    $this.legendScene.add ( labels['title'] );

                    for ( var i = 0; i < Object.keys( labels[ 'ticks' ] ).length; i++ ) {

                        $this.legendScene.add ( labels[ 'ticks' ][ i ] );
                        $this.legendScene.add ( labels[ 'lines' ][ i ] );

                    }

                    //console.log($this.scene);
                
                    $this.raycaster = new THREE.Raycaster();
                    $this.mouse = new THREE.Vector2();
                    //
                    $this.renderer = new THREE.WebGLRenderer( { antialias: true } );
                    $this.renderer.setPixelRatio( window.devicePixelRatio );
                    $this.renderer.autoClear = false;

                    container.append( $this.renderer.domElement );

                    $this.renderer.domElement.addEventListener('mousemove', onMouseMove, false);
                    $this.renderer.domElement.addEventListener('mousedown', onMouseDown, false);

                    $this.controls = new THREE.OrbitControls( $this.camera, $this.renderer.domElement );
                    $this.controlsAxes = new THREE.OrbitControls( $this.axisCamera, $this.renderer.domElement );

                    $this.renderInitialized = true;

                }

                function onWindowResize() {

                    $this.camera.aspect = container.width() / container.height();
                    $this.camera.updateProjectionMatrix();

                    $this.renderer.setSize( container.width(), container.height() );

                }

                function onMouseMove(event) {
                    event.preventDefault();

                    // update the mouse variable
                    var rect = $this.renderer.domElement.getBoundingClientRect()
                    $this.mouse.x = ( (event.clientX - rect.left) / container.width() ) * 2 - 1;
                    $this.mouse.y = - ( (event.clientY - rect.top) / container.height() ) * 2 + 1;

                    // find intersections

                    // create a Ray with origin at the mouse position
                    //   and direction into the scene (camera direction)
                    var vector = new THREE.Vector3( $this.mouse.x, $this.mouse.y, 1 );
                    projector.vector = vector;
                    projector.vector.unproject( $this.camera );
                    var ray = new THREE.Raycaster( $this.camera.position, vector.sub( $this.camera.position ).normalize() );

                    // create an array containing all objects in the scene with which the ray intersects
                    var intersects = ray.intersectObjects( objects );
        
                    // if there is one (or more) intersections
                    if ( intersects.length > 0 )
                    {
                        if(INTERSECTED==null) {
                            INTERSECTED = intersects[ 0 ];
                            if(wireframe !== null) {
                                wireframe.position.set(INTERSECTED.object.position.x, INTERSECTED.object.position.y, INTERSECTED.object.position.z);
                                $this.scene.add( wireframe );
                            }
                        }
                        else {
                            $this.scene.remove( wireframe );
                            INTERSECTED = intersects[ 0 ];
                            wireframe.position.set(INTERSECTED.object.position.x, INTERSECTED.object.position.y, INTERSECTED.object.position.z);
                            $this.scene.add( wireframe );	
                        }
                    }
                    else {
                        if(INTERSECTED) {
                            $this.scene.remove(wireframe);
                        }
                        INTERSECTED = null;
                    }
                }

                function onMouseDown(event) {
                    event.preventDefault();

                    // update the mouse variable
                    var rect = $this.renderer.domElement.getBoundingClientRect()
                    $this.mouse.x = ( (event.clientX - rect.left) / container.width() ) * 2 - 1;
                    $this.mouse.y = - ( (event.clientY - rect.top) / container.height() ) * 2 + 1;

                    // find intersections

                    // create a Ray with origin at the mouse position
                    //   and direction into the scene (camera direction)
                    var vector = new THREE.Vector3( $this.mouse.x, $this.mouse.y, 1 );
                    projector.vector = vector;
                    projector.vector.unproject( $this.camera );
                    var ray = new THREE.Raycaster( $this.camera.position, vector.sub( $this.camera.position ).normalize() );

                    // create an array containing all objects in the scene with which the ray intersects
                    var intersects = ray.intersectObjects( objects );

                    // if there is one (or more) intersections
                    if ( intersects.length > 0 )
                    {
                        var obj = intersects[ 0 ].object;
                        console.log(obj);
                        var idx = selectedObjects.indexOf(obj);
                        var wIdx = objects.indexOf(obj);
                        var oIdx = $this.cellQuantity - 1 - objects.indexOf(obj);
                        console.log(wIdx);
                        console.log(wireframes);
                        if(idx < 0) {
                            //obj.material = highlightedMaterial;
                            wireframes[wIdx].material = highlightedMaterial;
                            selectedObjects.push(obj);
                            
                            $this.selectedCells.push(oIdx);
                        } 
                        else {
                            wireframes[wIdx].material = wireframeMaterial;
                            selectedObjects.splice(idx, 1);
                            var sIdx = $this.selectedCells.indexOf(oIdx);
                            $this.selectedCells.splice(sIdx, 1);
                        }
                        console.log($this.selectedCells);
                    }
                    
                }

                //

                function animate() {

                    requestAnimationFrame( animate );

                    render();
                    $this.controls.update();

                }

                function render() {
                    $this.renderer.clear();
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
                    $this.renderer.render( $this.legendScene, $this.legendCamera );

                }
            }
        }
    }

    resizePanel(width, height) {
        this.camera.aspect = this.panel.width() / this.panel.height();
        this.camera.updateProjectionMatrix();

        this.axisCamera.updateProjectionMatrix();

        //this.renderer.setSize( this.panel.width(), this.panel.height() );
    }

    setWindow(window) {
        this.window = window;
    }
}