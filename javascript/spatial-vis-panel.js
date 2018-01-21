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
        //panel.append("<canvas id=" + id + "-spatial width=\"100%\" height=\"100%\"></canvas>");
        this.id = id;
        this.render();
    }

    render() {

        var $this = this;
        var objects = [];
        if(!this.renderInitialized) {
            if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

            //var this.camera, this.scene, this.renderer, stats;

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

                var map = new THREE.TextureLoader().load( '../texture/text.jpg' );
                map.wrapS = map.wrapT = THREE.RepeatWrapping;
                map.anisotropy = 16;

                var material = new THREE.MeshPhongMaterial( { map: map, side: THREE.DoubleSide } );
                //var material = new THREE.MeshBasicMaterial({color: 0x633005});

                var geometry = new THREE.Geometry();

                geometry.vertices = cubeVertices;
                geometry.faces = faces;
                geometry.computeFaceNormals();

                geometry.faceVertexUvs[0] = uvCoord;

                /*geometry.faces.forEach(function(face) {

                    var uvs = [];
                    var ids = [ 'a', 'b', 'c'];
                    for( var i = 0; i < ids.length; i++ ) {
                        var vertex = geometry.vertices[ face[ ids[ i ] ] ].clone();

                        var n = vertex.normalize();
                        var yaw = .5 - Math.atan( n.z, - n.x ) / ( 2.0 * Math.PI );
                        var pitch = .5 - Math.asin( n.y ) / Math.PI;

                        var u = yaw,
                            v = pitch;
                        uvs.push( new THREE.Vector2( u, v ) );
                    }
                    geometry.faceVertexUvs[ 0 ].push( uvs );
                });*/

                geometry.uvsNeedUpdate = true;

                console.log(geometry.faceVertexUvs);

                /*var triangles = THREE.ShapeUtils.triangulateShape( cubeVertices, holes );
                for( var i = 0; i < triangles.length; i++ ) {
                    geometry.faces.push( new THREE.Face3( triangles[i][0], triangles[i][1], triangles[i][2] ));
                }*/

                for(var i = 0; i < 10; i++) {
                    object = new THREE.Mesh( geometry, material );
                    object.position.set(2*(10/2 - i - 0.5), 0, 0 );
                    $this.scene.add(object);
                    objects.push(object);
                }
                
                $this.raycaster = new THREE.Raycaster();
                $this.mouse = new THREE.Vector2();

                /*var material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2, transparent: true } );
				$this.line = new THREE.Line( geometry, material );
				$this.scene.add( $this.line );*/

                /*var axisHelper = new THREE.AxisHelper( 100 );
                axisHelper.position.set(-100, 0, 0);
                $this.scene.add( axisHelper );*/
                //

                /*object = new THREE.Mesh( new THREE.SphereGeometry( 75, 20, 10 ), material );
                object.position.set( - 300, 0, 200 );
                $this.scene.add( object );

                object = new THREE.Mesh( new THREE.IcosahedronGeometry( 75, 1 ), material );
                object.position.set( - 100, 0, 200 );
                $this.scene.add( object );

                object = new THREE.Mesh( new THREE.OctahedronGeometry( 75, 2 ), material );
                object.position.set( 100, 0, 200 );
                $this.scene.add( object );

                object = new THREE.Mesh( new THREE.TetrahedronGeometry( 75, 0 ), material );
                object.position.set( 300, 0, 200 );
                $this.scene.add( object );

                //

                object = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 4, 4 ), material );
                object.position.set( - 300, 0, 0 );
                $this.scene.add( object );*/

                /*object = new THREE.Mesh( new THREE.BoxGeometry( 100, 100, 100, 4, 4, 4 ), material );
                object.position.set( - 100, 0, 200 );
                $this.scene.add( object );*/

                /*object = new THREE.Mesh( new THREE.CircleGeometry( 50, 20, 0, Math.PI * 2 ), material );
                object.position.set( 100, 0, 0 );
                $this.scene.add( object );

                object = new THREE.Mesh( new THREE.RingGeometry( 10, 50, 20, 5, 0, Math.PI * 2 ), material );
                object.position.set( 300, 0, 0 );
                $this.scene.add( object );

                //

                object = new THREE.Mesh( new THREE.CylinderGeometry( 25, 75, 100, 40, 5 ), material );
                object.position.set( - 300, 0, - 200 );
                $this.scene.add( object );*/

                /*var points = [];

                for ( var i = 0; i < 50; i ++ ) {

                    points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * Math.sin( i * 0.1 ) * 15 + 50, ( i - 5 ) * 2 ) );

                }*/

                /*object = new THREE.Mesh( new THREE.LatheGeometry( points, 20 ), material );
                object.position.set( - 100, 0, - 200 );
                $this.scene.add( object );

                object = new THREE.Mesh( new THREE.TorusGeometry( 50, 20, 20, 20 ), material );
                object.position.set( 100, 0, - 200 );
                $this.scene.add( object );

                object = new THREE.Mesh( new THREE.TorusKnotGeometry( 50, 10, 50, 20 ), material );
                object.position.set( 300, 0, - 200 );
                $this.scene.add( object );*/

                //

                $this.renderer = new THREE.WebGLRenderer( { antialias: true } );
                $this.renderer.setPixelRatio( window.devicePixelRatio );
                $this.renderer.setSize( container.width(), container.height() );

                container.append( $this.renderer.domElement );



                //stats = new Stats();
                //container.appendChild( stats.dom );

                //

                //container[0].addEventListener( 'resize', onWindowResize, false );

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

                $this.mouse.x = ( event.clientX  );
				$this.mouse.y = - ( event.clientY );
            }

            //

            function animate() {

                requestAnimationFrame( animate );

                render();
                //stats.update();

            }

            function render() {

                /*var timer = Date.now() * 0.0001;

                $this.camera.position.x = Math.cos( timer ) * 8;
                $this.camera.position.z = Math.sin( timer ) * 8;

                $this.camera.lookAt( $this.scene.position );*/

                /*$this.scene.traverse( function( object ) {

                    if ( object.isMesh === true ) {

                        object.rotation.x = timer * 5;
                        object.rotation.y = timer * 2.5;

                    }

                } );*/

                $this.raycaster.setFromCamera( $this.mouse, $this.camera );

                var intersects = $this.raycaster.intersectObjects( objects );

                if ( intersects.length > 0 ) {
                    var intersect = intersects[ 0 ];
                    console.log(intersect);
                    //console.log($this.mouse);
					/*var face = intersect.face;
					var linePosition = $this.line.geometry.attributes.position;
					var meshPosition = objects.geometry.attributes.position;
					linePosition.copyAt( 0, meshPosition, face.a );
					linePosition.copyAt( 1, meshPosition, face.b );
					linePosition.copyAt( 2, meshPosition, face.c );
					linePosition.copyAt( 3, meshPosition, face.a );
					objects.updateMatrix();
					$this.line.geometry.applyMatrix( objects.matrix );
					$this.line.visible = true;*/
				} else {
                    console.log("No intersect");
                    //console.log($this.mouse);
					//$this.line.visible = false;
				}

                $this.controls.update();

                $this.renderer.render( $this.scene, $this.camera );

            }
        }
    }

    resizePanel(width, height) {
        this.camera.aspect = this.panel.width() / this.panel.height();
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( this.panel.width(), this.panel.height() );
        //this.render();
    }

    setWindow(window) {
        this.window = window;
    }
}