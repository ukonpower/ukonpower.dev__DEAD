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
			Raycaster
		-------------------------------*/

		this.gManager.eRay.addEventListener( 'enter', e => {

			if ( this.renderer ) {

				document.body.style.cursor = 'pointer';

			}

		} );

		this.gManager.eRay.addEventListener( 'out', e => {

			if ( this.renderer ) {

				document.body.style.cursor = 'auto';

			}

		} );

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

		this.world.content.addEventListener( 'open', ( e ) => {

			this.openContent( e.contentName );

		} );

		this.world.content.addEventListener( 'close', () => {

			this.closeContent();

		} );

		//  compile shaders

		this.renderPipeline.resize( this.info.size.canvasPixelSize );
		this.renderPipeline.render( this.scene, this.camera );

		/*-------------------------------
			Connector
		-------------------------------*/

		this.connector = new ORE.BlenderConnector();

		this.connector.addListener( 'update/scene', async ( connector: ORE.BlenderConnector ) => {

			// camera
			let cameraAction = connector.getAction( 'OP_CameraAction' ) as ORE.AnimationAction;
			let cameraTargetAction = connector.getAction( 'OP_CameraTargetAction' ) as ORE.AnimationAction;
			let lensAction = connector.getAction( 'CameraAction.001' ) as ORE.AnimationAction;

			let contentCameraAction = connector.getAction( 'Content_CameraAction' ) as ORE.AnimationAction;
			let contentCameraTargetAction = connector.getAction( 'Content_CameraTargetAction' ) as ORE.AnimationAction;
			let contentLensAction = connector.getAction( 'CameraAction.001' ) as ORE.AnimationAction;

			if ( this.cameraController ) {

				this.cameraController.setAction( {
					op: {
						cameraAction: cameraAction,
						cameraTargetAction: cameraTargetAction,
						lensAction: lensAction
					},
					content: {
						cameraAction: contentCameraAction,
						cameraTargetAction: contentCameraTargetAction,
						lensAction: contentLensAction
					}
				} );

			}

			// world

			let faceOPMaterialAction = connector.getActionContainsAccessor( 'FaceVisibility' );

			if ( this.world && faceOPMaterialAction ) {

				this.world.content.ukonpower.setAction( faceOPMaterialAction );

			}

			// play opening

			if ( this.cameraController && this.world ) {

				let skip = true;

				this.world.content.ukonpower.play( "op", skip );

				let prm = this.cameraController.play( 'op', skip );

				if ( prm ) {

					await prm;

				}

				this.dispatchEvent( {
					type: 'loaded'
				} );

			}

		} );

		// @ts-ignore
		// this.connector.syncJsonScene( './assets/scene/ukonpower.json' );

		this.connector.addListener( 'update/timeline', ( current: number ) => {

			// if ( this.cameraController ) {

			// 	this.cameraController.updateFrame( current );

			// 	if ( this.world ) {

			// 		this.world.ukonpower.updateFrame( current );

			// 	}

			// }

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

	/*-------------------------------
		Content
	-------------------------------*/

	public openContent( contentName: string ) {

		if ( this.cameraController ) {

			this.cameraController.play( 'content' );

		}

	}

	public closeContent( ) {

		if ( this.cameraController ) {

			this.cameraController.play( 'contentClose' );

		}

	}

	/*-------------------------------
		Resize
	-------------------------------*/

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

	/*-------------------------------
		Pointer Events
	-------------------------------*/

	public onHover( args: ORE.TouchEventArgs ) {

		if ( this.cameraController ) {

			this.cameraController.updateCursor( args.normalizedPosition );

		}

		if ( this.gManager && ( args.delta.x != 0 || args.delta.y != 0 ) ) {

			this.gManager.eRay.update( args.normalizedPosition, this.camera );

		}

	}

	public onTouchStart( args: ORE.TouchEventArgs ) {

		if ( this.gManager ) {

			this.gManager.eRay.touchStart( args.normalizedPosition, this.camera );

		}

	}

	public onTouchMove( args: ORE.TouchEventArgs ) {

	}

	public onTouchEnd( args: ORE.TouchEventArgs ) {

		if ( this.gManager ) {

			this.gManager.eRay.touchEnd( args.normalizedPosition, this.camera );

		}

	}

}
