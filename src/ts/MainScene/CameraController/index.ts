import * as THREE from 'three';
import * as ORE from 'ore-three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import EventEmitter from 'wolfy87-eventemitter';

export class CameraController extends EventEmitter {

	private camera: THREE.PerspectiveCamera;
	private cameraTransform: THREE.Object3D;
	private cameraTarget: THREE.Object3D;
	private cameraData: THREE.PerspectiveCamera;

	private cursorPos: THREE.Vector2;
	public cursorPosDelay: THREE.Vector2;
	private cameraMoveWeight: THREE.Vector2;

	private controls?: OrbitControls;

	private baseFov: number;
	private focalLength: number;

	private layerInfoMem: ORE.LayerInfo | null;

	/*-------------------------------
		Animation
	-------------------------------*/

	private cameraAction?: ORE.AnimationAction | null = null;
	private cameraTargetAction?: ORE.AnimationAction | null = null;
	private lensAction?: ORE.AnimationAction | null = null;

	constructor( camera: THREE.PerspectiveCamera, cameraContainer: THREE.Object3D, cameraTarget: THREE.Object3D ) {

		super();

		this.camera = camera;
		this.baseFov = 30;
		this.focalLength = 30;

		this.layerInfoMem = null;

		this.cameraTransform = cameraContainer;
		this.cameraData = cameraContainer.children[ 0 ] as THREE.PerspectiveCamera;
		this.cameraTarget = cameraTarget;

		this.cursorPos = new THREE.Vector2();
		this.cursorPosDelay = new THREE.Vector2();
		this.cameraMoveWeight = new THREE.Vector2( 0.1, 0.1 );

		this.camera.position.copy( this.cameraTransform.position );

		// this.controls = new OrbitControls( this.camera, document.querySelector( '#canvas' ) as HTMLCanvasElement );
		// this.controls.target = ( this.cameraTarget.position );

	}

	public updateCursor( pos: THREE.Vector2 ) {

		if ( pos.x != pos.x ) return;

		this.cursorPos.set( Math.min( 1.0, Math.max( - 1.0, pos.x ) ), Math.min( 1.0, Math.max( - 1.0, pos.y ) ) );

	}

	public update( deltaTime: number ) {

		deltaTime = Math.min( 0.3, deltaTime );

		if ( this.controls ) {

			this.controls.update();
			return;

		}

		let diff = this.cursorPos.clone().sub( this.cursorPosDelay ).multiplyScalar( deltaTime * 1.0 );
		diff.multiply( diff.clone().addScalar( 1.0 ) );
		this.cursorPosDelay.add( diff );

		this.camera.position.set( this.cameraTransform.position.x + this.cursorPosDelay.x * this.cameraMoveWeight.x, this.cameraTransform.position.y + this.cursorPosDelay.y * this.cameraMoveWeight.y, this.cameraTransform.position.z );
		this.camera.lookAt( this.cameraTarget.position );

	}

	/*-------------------------------
		BC Animation
	-------------------------------*/

	public setAction( cameraAction: ORE.AnimationAction, cameraTargetAction: ORE.AnimationAction, lensAction: ORE.AnimationAction ) {

		this.emitEvent( 'updateAction' );

		const onUpdateCameraAction = ( action: ORE.AnimationAction ) => {

			action.getValue( 'CameraPos', this.cameraTransform.position );

		};

		const onUpdateCameraTargetAction = ( action: ORE.AnimationAction ) => {

			action.getValue( 'CameraTargetPos', this.cameraTarget.position );


		};

		const onUpdateLensAction = ( action: ORE.AnimationAction ) => {

			this.focalLength = action.getValue<number>( 'FocalLength' ) || this.focalLength;

			this.resize();

		};

		cameraAction.addListener( 'update', onUpdateCameraAction );
		cameraTargetAction.addListener( 'update', onUpdateCameraTargetAction );
		lensAction.addListener( 'update', onUpdateLensAction );

		this.addOnceListener( 'updateAction', () => {

			cameraAction.removeListener( 'update', onUpdateCameraAction );
			cameraTargetAction.removeListener( 'update', onUpdateCameraTargetAction );
			lensAction.removeListener( 'update', onUpdateCameraAction );

		} );

		this.cameraAction = cameraAction;
		this.cameraTargetAction = cameraTargetAction;
		this.lensAction = lensAction;

	}

	public updateFrame( frame: number ) {

		if ( this.cameraAction ) {

			this.cameraAction.updateFrame( frame );

		}

		if ( this.cameraTargetAction ) {

			this.cameraTargetAction.updateFrame( frame );

		}

		if ( this.lensAction ) {

			this.lensAction.updateFrame( frame );

		}

	}

	/*-------------------------------
		Resize
	-------------------------------*/

	public resize( layerInfo?: ORE.LayerInfo ) {

		if ( layerInfo ) {

			this.layerInfoMem = layerInfo;

		}


		if ( this.layerInfoMem ) {

			let fov = 2.0 * Math.atan( 36 / ( 2.0 * this.focalLength ) ) / Math.PI * 180.0;

			this.camera.fov = fov / ( 16 / 9 ) + this.layerInfoMem.size.portraitWeight * 40.0;
			this.camera.updateProjectionMatrix();

		}

	}

}
