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
			Renderer
		-------------------------------*/

		this.renderer.shadowMap.enabled = true;
		this.renderPipeline = new RenderPipeline( this.renderer, this.commonUniforms );

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

		//  compile shaders

		this.renderPipeline.resize( this.info.size.canvasPixelSize );
		this.renderPipeline.render( this.scene, this.camera );

		/*-------------------------------
			Connector
		-------------------------------*/

		this.connector = new ORE.BlenderConnector();

		this.connector.addListener( 'update/scene', ( connector: ORE.BlenderConnector ) => {

			console.log( this.connector?.actions );
			// camera

			// let cameraAction = connector.getAction( 'OP_CameraAction' );
			// let cameraTargetAction = connector.getAction( 'OP_CameraTargetAction' );
			// let lensAction = connector.getAction( 'CameraAction.001' );

			let cameraAction = connector.getAction( 'Content_CameraAction' );
			let cameraTargetAction = connector.getAction( 'Content_CameraTargetAction' );
			let lensAction = connector.getAction( 'CameraAction.001' );


			if ( cameraAction && cameraTargetAction && lensAction && this.cameraController ) {

				this.cameraController.setAction( { cameraAction, cameraTargetAction, lensAction } );
				// this.cameraController.play( { cameraAction, cameraTargetAction, lensAction } );

			}

			// world

			let faceOPMaterialAction = connector.getActionContainsAccessor( 'FaceVisibility' );

			if ( this.world && faceOPMaterialAction ) {

				this.world.face.setAction( faceOPMaterialAction );
				// this.world.face.play( "op" );

			}

			// play opening

			if ( this.cameraController && this.world ) {

				this.dispatchEvent( {
					type: 'loaded'
				} );

			}

		} );

		// @ts-ignore
		// this.connector.syncJsonScene( './assets/scene/ukonpower.json' );

		this.connector.addListener( 'update/timeline', ( current: number ) => {

			if ( this.cameraController ) {

				this.cameraController.updateFrame( current );

				if ( this.world ) {

					this.world.face.updateFrame( current );

				}

			}

		} );

		// @ts-ignore
		this.connector.connect( 'ws://localhost:3100' );

	}

	public animate( deltaTime: number ) {

		if ( this.gManager ) {

			this.gManager.update( deltaTime );

		}

		if ( this.cameraController ) {

			this.cameraController.update( deltaTime );
			this.camera.updateMatrixWorld();
			this.camera.matrixWorldNeedsUpdate = false;

		}

		if ( this.world ) {

			this.world.update( deltaTime, this.time, this.camera );

		}

		if ( this.renderPipeline ) {

			this.renderPipeline.render( this.scene, this.camera );

		}

	}

	public onResize() {

		super.onResize();

		let canvasInner = document.querySelector( '.canvas-inner' ) as HTMLElement;
		canvasInner.style.top = Math.floor( window.innerHeight / 2 ) + "px";

		if ( this.cameraController ) {

			this.cameraController.resize( this.info );

		}

		if ( this.world ) {

			this.world.resize( this.info );

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
