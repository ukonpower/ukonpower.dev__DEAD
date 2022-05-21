import * as THREE from 'three';
import * as ORE from 'ore-three';

export class Content extends THREE.Object3D {

	private commonUniforms: ORE.Uniforms;

	private contentMesh: THREE.Mesh;
	private contentMeshSize: THREE.Box3;

	private domCanvasElm: HTMLElement;
	private domCanvasCameraElm: HTMLElement;
	private contentElm: HTMLElement;

	private domSize: THREE.Vector2 = new THREE.Vector2();
	private domSizeHalf: THREE.Vector2 = new THREE.Vector2();

	constructor( contentMesh: THREE.Mesh, parentUniforms: ORE.Uniforms ) {

		super();

		this.contentMesh = contentMesh;
		this.contentMeshSize = new THREE.Box3().setFromObject( this.contentMesh );

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		this.contentElm = document.querySelector( '.content' ) as HTMLElement;
		this.domCanvasElm = document.querySelector( '.domCanvas' ) as HTMLElement;
		this.domCanvasCameraElm = document.querySelector( '.domCanvas-camera' ) as HTMLElement;

	}

	private getCameraCSSMatrix( matrix: THREE.Matrix4 ) {

		const elements = matrix.elements;
		return 'matrix3d(' + elements[ 0 ] + ',' + - elements[ 1 ] + ',' + elements[ 2 ] + ',' + elements[ 3 ] + ',' + elements[ 4 ] + ',' + - elements[ 5 ] + ',' + elements[ 6 ] + ',' + elements[ 7 ] + ',' + elements[ 8 ] + ',' + - elements[ 9 ] + ',' + elements[ 10 ] + ',' + elements[ 11 ] + ',' + elements[ 12 ] + ',' + - elements[ 13 ] + ',' + elements[ 14 ] + ',' + elements[ 15 ] + ')';

	}

	private getObjectCSSMatrix( matrix: THREE.Matrix4 ) {

		const elements = matrix.elements;
		const matrix3d = 'matrix3d(' + elements[ 0 ] + ',' + elements[ 1 ] + ',' + elements[ 2 ] + ',' + elements[ 3 ] + ',' + - elements[ 4 ] + ',' + - elements[ 5 ] + ',' + - elements[ 6 ] + ',' + - elements[ 7 ] + ',' + elements[ 8 ] + ',' + elements[ 9 ] + ',' + elements[ 10 ] + ',' + elements[ 11 ] + ',' + elements[ 12 ] + ',' + elements[ 13 ] + ',' + elements[ 14 ] + ',' + elements[ 15 ] + ')';
		return 'translate(-50%,-50%)' + matrix3d;

	}

	public update( deltaTime: number, camera: THREE.PerspectiveCamera ) {

		let fov = Math.round( camera.projectionMatrix.elements[ 5 ] * this.domSizeHalf.y );

		this.domCanvasElm.style.perspective = fov + 'px';

		this.domCanvasCameraElm.style.transform = 'translateZ(' + fov + 'px)' + this.getCameraCSSMatrix( camera.matrixWorldInverse ) + 'translate(' + this.domSizeHalf.x + 'px,' + this.domSizeHalf.y + 'px)';
		this.contentElm.style.transform = this.getObjectCSSMatrix( this.contentMesh.matrixWorld.multiply( new THREE.Matrix4().makeScale( 1.0 / this.contentElm.clientWidth, 1.0 / this.contentElm.clientHeight, 1.0 ) ) );

	}

	public resize( layerInfo: ORE.LayerInfo ) {

		let width = layerInfo.size.canvasSize.x;
		let height = layerInfo.size.canvasSize.y;

		this.domSize.set( width, height );
		this.domSizeHalf.set( width, height ).multiplyScalar( 0.5 );

		this.domCanvasCameraElm.style.width = width + 'px';
		this.domCanvasCameraElm.style.height = height + 'px';

		this.domCanvasElm.style.width = width + 'px';
		this.domCanvasElm.style.height = height + 'px';

	}

}
