class SpatialVisualizationPanel extends AbstractPanelBuilder {
    constructor(data, id, window) {
        super();
        this.id = id;
        this.data = data;
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
        this.legends = [];
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
        this.marginSize = 17;

        this.getRemoteData();
    }

    appendToPanel(panel, id) {
        this.panel = panel;
        panel.css({'overflow': 'auto'});
        this.id = id;
        this.render();
    }

    setVariableList(varList) {
        this.varList = varList;
        this.renderInitialized = false;
        this.renderers.splice(0,this.renderers.length);
        this.scenes.splice(0,this.scenes.length);
        this.axisScenes.splice(0,this.axisScenes.length);
        this.legendScenes.splice(0,this.legendScenes.length);
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
        $("body").find("canvas").remove();
        //var objects = [];
        //var wireframes = [];
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
        
        var legend = [];
        
        $this.raycaster = new THREE.Raycaster();
        $this.mouse = new THREE.Vector2();

        var INTERSECTED = null;

        var sceneQty = $this.varList.length;
        console.log($this.varList.length);
        if(sceneQty <= 1) {
            sceneQty = 1;
        }
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

                

                var holes = [];
                var container = $this.panel;

                init();
                animate();
                
                function init() {

                    for(var sceneIdx = 0; sceneIdx < sceneQty; sceneIdx++) {

                        /*var canvas = container.append("<canvas id=\"scene-"+ sceneIdx + "\" width=" + container.width() + " height=" + container.height() + "></canvas>")
                                            .children("canvas:last-child");*/

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

                        var scene = new THREE.Scene();
                        scene.background = new THREE.Color(0x59B0E8);
                        var axisScene = new THREE.Scene();
                        var legendScene = new THREE.Scene();

                        var ambientLight = new THREE.AmbientLight( 0x111111);
                        scene.add( ambientLight );
                        axisScene.add(ambientLight);
                        legendScene.add(ambientLight);

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
                        camera.lookAt( scene.position );   
                        axisCamera.lookAt(axisScene.position); 
                        legendCamera.lookAt(0, 0, 0);

                        scene.userData.camera = camera;
                        axisScene.userData.camera = axisCamera;
                        legendScene.userData.camera = legendCamera;
                        scene.userData.objects = [];
                        scene.userData.wireframes = [];
                        scene.userData.wireframe = wireframe;

                        for(var i = 0; i < $this.cellQuantity; i++) {
                            var aObject = Object.assign(objects[i]);
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
                        var axis = new THREE.AxesHelper(2);
                        axisScene.add(axis);
                    
                        // Legend
                        legend = lut.setLegendOn({'layout': legendLayout, 'position': {'x': 0, 'y': 0, 'z' : 0}});
                        var labels = lut.setLegendLabels({'title': 'Test', 'um': 'hue', 'ticks': 5, 'fontsize': 45});
                        legendScene.add( legend );
                        legendScene.add ( labels['title'] );

                        for ( var i = 0; i < Object.keys( labels[ 'ticks' ] ).length; i++ ) {
                            legendScene.add ( labels[ 'ticks' ][ i ] );
                            legendScene.add ( labels[ 'lines' ][ i ] );
                        }

                        $this.scenes.push(scene);
                        $this.axisScenes.push(axisScene);
                        $this.legendScenes.push(legendScene);

                        var renderer = new THREE.WebGLRenderer( { antialias: true } );
                        renderer.setPixelRatio( window.devicePixelRatio );
                        renderer.autoClear = false;
                        renderer.userData = {};
                        renderer.domElement.id = sceneIdx;

                        container.append(renderer.domElement);
                        //console.log(canvas[0]);

                        renderer.domElement.addEventListener('mousemove', onMouseMove, false);
                        renderer.domElement.addEventListener('mousedown', onMouseDown, false);
                        //renderer.userData.canvas = canvas[0];

                        var controls = new THREE.OrbitControls( camera, renderer.domElement );
                        var controlsAxes = new THREE.OrbitControls( axisCamera, renderer.domElement );
                        renderer.userData.controls = controls;
                        renderer.userData.controlsAxes = controlsAxes;

                        $this.renderers.push(renderer);


                    }

                    console.log($this.scenes);
                    
                    /*$this.renderer = new THREE.WebGLRenderer( { antialias: true } );
                    $this.renderer.setPixelRatio( window.devicePixelRatio );
                    $this.renderer.autoClear = false;

                    for(var i = 0; i < sceneQty; i++) {
                        console.log("Pao");
                        container.append( $this.renderer.domElement );
                    }*/
                    
                    /*$this.renderer.domElement.addEventListener('mousemove', onMouseMove, false);
                    $this.renderer.domElement.addEventListener('mousedown', onMouseDown, false);

                    $this.controls = new THREE.OrbitControls( $this.camera, $this.renderer.domElement );
                    $this.controlsAxes = new THREE.OrbitControls( $this.axisCamera, $this.renderer.domElement );*/

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
                        /*var obj = intersects[ 0 ].object;
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
                        console.log($this.selectedCells);*/
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
                        var axesRect = {left: 0, right: 100, bottom: container.height()-$this.marginSize, top: container.height()-100};
                        // set the viewport
					    var width  = axesRect.right - axesRect.left;
					    var height = axesRect.bottom - axesRect.top;
					    var left   = axesRect.left;
                        var top    = axesRect.top;
                        renderer.setViewport(left, top, width, height);
                        renderer.render($this.axisScenes[i], $this.axisScenes[i].userData.camera);

                        renderer.clearDepth();
                        var legendRect = {left: container.width()-150, right: container.width()-$this.marginSize, top: 0, bottom: 150};
                        var width  = legendRect.right - legendRect.left;
					    var height = legendRect.bottom - legendRect.top;
					    var left   = legendRect.left;
                        var top    = legendRect.top;
                        renderer.setViewport( left, top, width, height );
                        renderer.render( $this.legendScenes[i], $this.legendScenes[i].userData.camera);

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
        this.camera.aspect = this.panel.width() / this.panel.height();
        this.camera.updateProjectionMatrix();

        this.axisCamera.updateProjectionMatrix();

        //this.renderer.setSize( this.panel.width(), this.panel.height() );
    }

    setWindow(window) {
        this.window = window;
    }
}