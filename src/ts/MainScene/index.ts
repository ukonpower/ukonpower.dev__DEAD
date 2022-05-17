import * as ORE from 'ore-three';
import * as THREE from 'three';
import { GlobalManager } from './GlobalManager';
import { RenderPipeline } from './RenderPipeline';
import { CameraController } from './CameraController';
import { AssetManager } from './GlobalManager/AssetManager';
import { World } from './World';

export class MainScene extends ORE.BaseLayer {

	private gManager?: GlobalManager;
	private renderPipeline?: RenderPipeline;
	private cameraController?: CameraController;

	private connector?: ORE.BlenderConnector;

	private world?: World;
	private envMap?: THREE.CubeTexture;

	constructor() {

		super();

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( this.commonUniforms, {} );

	}

	onBind( info: ORE.LayerInfo ) {

		super.onBind( info );

		this.gManager = new GlobalManager();

		/*-------------------------------
			load Scene
		-------------------------------*/

		this.gManager.assetManager.load( { assets: [
			{ name: 'scene', path: './assets/scene/ukonpower.glb', type: 'gltf' },
			{ name: 'noise', path: './assets/scene/img/noise.png', type: 'tex', onLoad: ( t: THREE.Texture ) => {

				t.wrapS = THREE.RepeatWrapping;
				t.wrapT = THREE.RepeatWrapping;

			} }
		] } );

		this.gManager.assetManager.addEventListener( 'loadMustAssets', ( e ) => {

			let gltf = ( e.target as AssetManager ).getGltf( 'scene' );

			if ( gltf ) {

				this.scene.add( gltf.scene );

			}

			this.initScene();
			this.onResize();

		} );

		/*-------------------------------
			Load env
		-------------------------------*/

		new THREE.CubeTextureLoader().load( [
			'./assets/envmap/px.png',
			'./assets/envmap/nx.png',
			'./assets/envmap/py.png',
			'./assets/envmap/ny.png',
			'./assets/envmap/pz.png',
			'./assets/envmap/nz.png',
		], tex => {

			this.envMap = tex;

			if ( this.world ) {

				this.world.updateEnvMap( this.envMap );

			}

		} );

	}

	private initScene() {

		// rendererはきっとある.
		if ( ! this.renderer ) return;

		/*-------------------------------
			Connector
		-------------------------------*/

		this.connector = new ORE.BlenderConnector();

		this.connector.addListener( 'update/scene', ( connector: ORE.BlenderConnector ) => {

			/*-------------------------------
				Camera
			-------------------------------*/

			let cameraAction = connector.getAction( 'CameraAction' );
			let cameraTargetAction = connector.getAction( 'CameraTargetAction' );
			let lensAction = connector.getAction( 'CameraAction.001' );

			if ( cameraAction && cameraTargetAction && lensAction && this.cameraController ) {

				this.cameraController.setAction( cameraAction, cameraTargetAction, lensAction );

			}

			/*-------------------------------
				World
			-------------------------------*/

			let faceMaterialAction = connector.getActionContainsAccessor( 'FaceVisibility' );

			if ( this.world && faceMaterialAction ) {

				this.world.face.setAction( faceMaterialAction );

			}

			/*-------------------------------
				Loaded
			-------------------------------*/

			if ( this.cameraController ) {

				this.cameraController.play( 'op' );

			}

		} );

		this.connector.addListener( 'update/timeline', ( current: number ) => {

			if ( this.cameraController ) {

				this.cameraController.updateFrame( current );

				if ( this.world ) {

					this.world.face.updateFrame( current );

				}

			}

		} );

		if ( true ) {

			// @ts-ignore
			this.connector.syncJsonScene( './assets/scene/ukonpower.json' );

		} else {

			// @ts-ignore
			this.connector.connect( 'ws://localhost:3100' );

		}

		/*-------------------------------
			Renderer
		-------------------------------*/

		if ( this.renderer ) {

			this.renderer.shadowMap.enabled = true;

			this.renderPipeline = new RenderPipeline( this.renderer, this.commonUniforms );

		}

		/*-------------------------------
			CameraController
		-------------------------------*/

		this.cameraController = new CameraController( this.camera, this.scene.getObjectByName( 'Camera' ) as THREE.Object3D, this.scene.getObjectByName( 'CameraTarget' ) as THREE.Object3D );

		/*-------------------------------
			World
		-------------------------------*/

		this.world = new World( this.renderer, this.scene, this.commonUniforms );
		this.scene.add( this.world );

		if ( this.envMap ) {

			this.world.updateEnvMap( this.envMap );

		}

	}

	public animate( deltaTime: number ) {

		if ( this.gManager ) {

			this.gManager.update( deltaTime );

		}

		if ( this.cameraController ) {

			this.cameraController.update( deltaTime );

		}

		if ( this.world ) {

			this.world.update( deltaTime, this.time );

		}

		if ( this.renderPipeline ) {

			this.renderPipeline.render( this.scene, this.camera );

		}

	}

	public onResize() {

		super.onResize();

		if ( this.cameraController ) {

			this.cameraController.resize( this.info );

		}

		if ( this.renderPipeline ) {

			this.renderPipeline.resize( this.info.size.canvasPixelSize );

		}

	}

	public onHover( args: ORE.TouchEventArgs ) {

		if ( this.cameraController ) {

			this.cameraController.updateCursor( args.normalizedPosition );

		}

	}

	public onTouchStart( args: ORE.TouchEventArgs ) {

	}

	public onTouchMove( args: ORE.TouchEventArgs ) {

	}

	public onTouchEnd( args: ORE.TouchEventArgs ) {

	}

}
