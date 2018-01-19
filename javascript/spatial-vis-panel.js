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
        if(!this.renderInitialized) {
            if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

            //var this.camera, this.scene, this.renderer, stats;

            var container = $this.panel;

            init();
            animate();
            
            function init() {

                
                console.log(container.width());
                $this.camera = new THREE.PerspectiveCamera( 45, container.width() / container.height(), 1, 2000 );
                $this.camera.position.y = 400;

                $this.scene = new THREE.Scene();

                var light, object;

                var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
                $this.scene.add( ambientLight );

                var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
                $this.camera.add( pointLight );
                $this.scene.add( $this.camera );

                var map = new THREE.TextureLoader().load( '../texture/UV_Grid_Sm.jpg' );
                map.wrapS = map.wrapT = THREE.RepeatWrapping;
                map.anisotropy = 16;

                var material = new THREE.MeshPhongMaterial( { map: map, side: THREE.DoubleSide } );

                //

                object = new THREE.Mesh( new THREE.SphereGeometry( 75, 20, 10 ), material );
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
                $this.scene.add( object );

                object = new THREE.Mesh( new THREE.BoxGeometry( 100, 100, 100, 4, 4, 4 ), material );
                object.position.set( - 100, 0, 0 );
                $this.scene.add( object );

                object = new THREE.Mesh( new THREE.CircleGeometry( 50, 20, 0, Math.PI * 2 ), material );
                object.position.set( 100, 0, 0 );
                $this.scene.add( object );

                object = new THREE.Mesh( new THREE.RingGeometry( 10, 50, 20, 5, 0, Math.PI * 2 ), material );
                object.position.set( 300, 0, 0 );
                $this.scene.add( object );

                //

                object = new THREE.Mesh( new THREE.CylinderGeometry( 25, 75, 100, 40, 5 ), material );
                object.position.set( - 300, 0, - 200 );
                $this.scene.add( object );

                var points = [];

                for ( var i = 0; i < 50; i ++ ) {

                    points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * Math.sin( i * 0.1 ) * 15 + 50, ( i - 5 ) * 2 ) );

                }

                object = new THREE.Mesh( new THREE.LatheGeometry( points, 20 ), material );
                object.position.set( - 100, 0, - 200 );
                $this.scene.add( object );

                object = new THREE.Mesh( new THREE.TorusGeometry( 50, 20, 20, 20 ), material );
                object.position.set( 100, 0, - 200 );
                $this.scene.add( object );

                object = new THREE.Mesh( new THREE.TorusKnotGeometry( 50, 10, 50, 20 ), material );
                object.position.set( 300, 0, - 200 );
                $this.scene.add( object );

                //

                $this.renderer = new THREE.WebGLRenderer( { antialias: true } );
                $this.renderer.setPixelRatio( window.devicePixelRatio );
                $this.renderer.setSize( container.width(), container.height() );

                container.append( $this.renderer.domElement );

                //stats = new Stats();
                //container.appendChild( stats.dom );

                //

                //container[0].addEventListener( 'resize', onWindowResize, false );

                $this.renderInitialized = true;

            }

            function onWindowResize() {

                $this.camera.aspect = container.width() / container.height();
                $this.camera.updateProjectionMatrix();

                $this.renderer.setSize( container.width(), container.height() );

            }

            //

            function animate() {

                requestAnimationFrame( animate );

                render();
                //stats.update();

            }

            function render() {

                var timer = Date.now() * 0.0001;

                $this.camera.position.x = Math.cos( timer ) * 800;
                $this.camera.position.z = Math.sin( timer ) * 800;

                $this.camera.lookAt( $this.scene.position );

                $this.scene.traverse( function( object ) {

                    if ( object.isMesh === true ) {

                        object.rotation.x = timer * 5;
                        object.rotation.y = timer * 2.5;

                    }

                } );

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