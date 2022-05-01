import * as THREE from 'three';
import * as ORE from 'ore-three-ts';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class CameraController {

	private camera: THREE.PerspectiveCamera;
	private cameraTransform: THREE.Object3D;
	private cameraTarget: THREE.Object3D;
	private cameraData: THREE.PerspectiveCamera;

	private cursorPos: THREE.Vector2;
	public cursorPosDelay: THREE.Vector2;
	private cameraMoveWeight: THREE.Vector2;

	private controls?: OrbitControls;

	constructor( camera: THREE.PerspectiveCamera, cameraContainer: THREE.Object3D, cameraTarget: THREE.Object3D ) {

		this.camera = camera;

		this.cameraTransform = cameraContainer;
		this.cameraData = cameraContainer.children[ 0 ] as THREE.PerspectiveCamera;
		this.cameraTarget = cameraTarget;

		this.cursorPos = new THREE.Vector2();
		this.cursorPosDelay = new THREE.Vector2();
		this.cameraMoveWeight = new THREE.Vector2( 0.2, 0.2 );

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

	public resize( layerInfo: ORE.LayerInfo ) {

		this.camera.fov = this.cameraData.fov + layerInfo.size.portraitWeight * 20.0;
		this.camera.updateProjectionMatrix();

	}

}
