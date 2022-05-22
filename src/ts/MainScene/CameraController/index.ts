import * as THREE from 'three';
import * as ORE from 'ore-three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import EventEmitter from 'wolfy87-eventemitter';


type CameraAnimationAction = {
	cameraAction: ORE.AnimationAction,
	cameraTargetAction: ORE.AnimationAction,
	lensAction: ORE.AnimationAction
}

type CameraAnimationActions = {
	op: CameraAnimationAction,
	content: CameraAnimationAction
}

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

	private animator: ORE.Animator;
	private animationActions?: CameraAnimationActions;
	private playingAction?: CameraAnimationAction;

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
		this.cameraMoveWeight = new THREE.Vector2( 0.5, 0.5 );

		this.camera.position.copy( this.cameraTransform.position );

		// this.controls = new OrbitControls( this.camera, document.querySelector( '#canvas' ) as HTMLCanvasElement );
		// this.controls.target = ( this.cameraTarget.position );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.animator.add( {
			name: 'cameraAnimation',
			initValue: 0,
			easing: ORE.Easings.linear
		} );

		this.animator.add( {
			name: 'cameraPos',
			initValue: new THREE.Vector3(),
			easing: ORE.Easings.easeInOutCubic
		} );

		this.animator.add( {
			name: 'cameraTargetPos',
			initValue: new THREE.Vector3(),
			easing: ORE.Easings.easeInOutCubic
		} );

		this.animator.add( {
			name: 'cameraFocalLength',
			initValue: 0,
			easing: ORE.Easings.easeInOutCubic
		} );

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

		if ( this.animator.isAnimatingVariable( 'cameraAnimation' ) ) {

			this.updateFrame( this.animator.get( 'cameraAnimation' ) || 0 );

		} else if ( this.animator.isAnimatingVariable( 'cameraPos' ) ) {

			this.cameraTransform.position.copy( this.animator.get( 'cameraPos' ) as THREE.Vector3 );
			this.cameraTarget.position.copy( this.animator.get( 'cameraTargetPos' ) as THREE.Vector3 );
			this.focalLength = this.animator.get( 'cameraFocalLength' ) || 1;
			this.resize();

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

	public setAction( animationActions: CameraAnimationActions ) {

		this.emitEvent( 'updateAction' );

		this.animationActions = animationActions;

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

		// op events

		let opActions = this.animationActions.op;

		opActions.cameraAction.addListener( 'update', onUpdateCameraAction );
		opActions.cameraTargetAction.addListener( 'update', onUpdateCameraTargetAction );
		opActions.lensAction.addListener( 'update', onUpdateLensAction );

		this.addOnceListener( 'updateAction', () => {

			opActions.cameraAction.removeListener( 'update', onUpdateCameraAction );
			opActions.cameraTargetAction.removeListener( 'update', onUpdateCameraTargetAction );
			opActions.lensAction.removeListener( 'update', onUpdateCameraAction );

		} );

	}

	public updateFrame( frame: number ) {

		if ( this.playingAction ) {

			this.playingAction.cameraAction.updateFrame( frame );
			this.playingAction.cameraTargetAction.updateFrame( frame );
			this.playingAction.lensAction.updateFrame( frame );

		}

	}

	public play( type: string, skip?: boolean ) {

		if ( ! this.animationActions ) return;

		this.playingAction = undefined;

		if ( type == 'op' ) {

			let action = this.animationActions.op;

			this.playingAction = action;

			let frame = action.cameraAction.frame;

			let start = frame.start;
			let end = frame.end;

			if ( skip ) {

				this.updateFrame( end );

			} else {

				this.animator.setValue( 'cameraAnimation', start );
				return this.animator.animate( 'cameraAnimation', end, frame.duration / 30.0 );

			}

		} else if ( type == 'content' ) {

			let action = this.animationActions.content;
			action.cameraAction.updateFrame( action.cameraAction.frame.end );
			action.cameraTargetAction.updateFrame( action.cameraTargetAction.frame.end );
			action.lensAction.updateFrame( action.lensAction.frame.end );

			let newPos = action.cameraAction.getValue( 'CameraPos' );
			let newTargetPos = action.cameraTargetAction.getValue( 'CameraTargetPos' );
			let newLens = action.cameraTargetAction.getValue( 'CameraTargetPos' );

			this.animator.setValue( 'cameraPos', this.cameraTransform.position );
			this.animator.setValue( 'cameraTargetPos', this.cameraTarget.position );
			this.animator.setValue( 'cameraFocalLength', this.focalLength );

			let duration = 5.0;

			this.animator.animate( 'cameraPos', newPos, duration );
			this.animator.animate( 'cameraTargetPos', newTargetPos, duration );
			return this.animator.animate( 'cameraFocalLength', 20, duration );


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
