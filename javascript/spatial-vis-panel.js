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
        this.controls = null;
        this.raycaster = null;
        this.mouse = null;
        this.line = null;
    }

    appendToPanel(panel, id) {
        this.panel = panel;
        panel.css({'overflow': 'hidden'});
        this.id = id;
        this.render();
    }

    render() {

        var $this = this;
        var objects = [];
        var geometry = new THREE.Geometry();
        // initialize object to perform world/screen calculations
        var projector = new THREE.Projector();

        var INTERSECTED = null;
        var baseMap = new THREE.TextureLoader().load( '../texture/text.jpg' );
        baseMap.wrapS = baseMap.wrapT = THREE.RepeatWrapping;
        baseMap.anisotropy = 16;
        var baseMaterial = new THREE.MeshPhongMaterial( { map: baseMap, side: THREE.DoubleSide } );

        var highlightedMap = new THREE.TextureLoader().load( '../texture/textMouseover.jpg' );
        highlightedMap.wrapS = highlightedMap.wrapT = THREE.RepeatWrapping;
        highlightedMap.anisotropy = 16;
        var highlightedMaterial = new THREE.MeshPhongMaterial( { map: highlightedMap, side: THREE.DoubleSide } );
        if(!this.renderInitialized) {
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
                $this.camera = new THREE.PerspectiveCamera( 100, container.width() / container.height(), 1, 2000 );
                $this.camera.position.x = 0;
                $this.camera.position.y = 0;
                $this.camera.position.z = 10;

                $this.controls = new THREE.TrackballControls( $this.camera );
				$this.controls.rotateSpeed = 5.0;
				$this.controls.zoomSpeed = 1.2;
				$this.controls.panSpeed = 0.8;
				$this.controls.noZoom = false;
				$this.controls.noPan = false;
				$this.controls.staticMoving = true;
				$this.controls.dynamicDampingFactor = 0.3;

                $this.scene = new THREE.Scene();

                var light, object;

                var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
                $this.scene.add( ambientLight );

                var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
                $this.camera.add( pointLight );
                $this.scene.add( $this.camera );
                $this.camera.lookAt( $this.scene.position );               

                geometry.vertices = cubeVertices;
                geometry.faces = faces;
                geometry.computeFaceNormals();

                geometry.faceVertexUvs[0] = uvCoord;
                geometry.uvsNeedUpdate = true;

                for(var i = 0; i < 10; i++) {
                    object = new THREE.Mesh( geometry, baseMaterial );
                    object.position.set(2*(10/2 - i - 0.5), 0, 0 );
                    $this.scene.add(object);
                    objects.push(object);
                }
              
                $this.raycaster = new THREE.Raycaster();
                $this.mouse = new THREE.Vector2();
                //
                $this.renderer = new THREE.WebGLRenderer( { antialias: true } );
                $this.renderer.setPixelRatio( window.devicePixelRatio );
                $this.renderer.setSize( container.width(), container.height() );

                container.append( $this.renderer.domElement );

                $this.renderer.domElement.addEventListener('mousemove', onMouseMove, false);

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
			            INTERSECTED.object.material = highlightedMaterial;
                    }
                    else {
                        INTERSECTED.object.material= baseMaterial;
			            INTERSECTED.object.geometry.colorsNeedUpdate=true;
			            INTERSECTED = intersects[ 0 ];
			            INTERSECTED.object.material = highlightedMaterial;	
                    }
                    INTERSECTED.object.geometry.colorsNeedUpdate=true;
                }
                else {
                    if(INTERSECTED) {
                        INTERSECTED.object.material= baseMaterial;
			            INTERSECTED.object.geometry.colorsNeedUpdate=true;
                    }
                    INTERSECTED = null;
                }
            }

            //

            function animate() {

                requestAnimationFrame( animate );

                render();
                $this.controls.update();

            }

            function render() {
                $this.renderer.render( $this.scene, $this.camera );
            }
        }
    }

    resizePanel(width, height) {
        this.camera.aspect = this.panel.width() / this.panel.height();
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( this.panel.width(), this.panel.height() );
    }

    setWindow(window) {
        this.window = window;
    }
}