import * as THREE from 'three';
import * as ORE from 'ore-three';

import contentVert from './shaders/content.vs';
import contentFrag from './shaders/content.fs';
import { ContentData, ContentDataList } from '../../../../data/content';
import { Thumbnail } from './Thumbnail';

export class ContentInfo extends THREE.EventDispatcher {

	private commonUniforms: ORE.Uniforms;

	private animator: ORE.Animator;

	private mesh: THREE.Mesh;
	private contentMeshSize: THREE.Vector3;

	private domCanvasElm: HTMLElement;
	private domCanvasCameraElm: HTMLElement;
	private contentElm: HTMLElement;
	private backBtnElm: HTMLButtonElement;

	private domSize: THREE.Vector2 = new THREE.Vector2();
	private domSizeHalf: THREE.Vector2 = new THREE.Vector2();

	private thumbnail: Thumbnail;

	// state
	private viewing: boolean = false;

	constructor( contentMesh: THREE.Mesh, parentUniforms: ORE.Uniforms ) {

		super();

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.visibility = this.animator.add( {
			name: 'contentInfoVisibility',
			initValue: 0
		} );

		/*-------------------------------
			Elements
		-------------------------------*/

		this.contentElm = document.querySelector( '.content' ) as HTMLElement;
		this.domCanvasElm = document.querySelector( '.domCanvas' ) as HTMLElement;
		this.domCanvasCameraElm = document.querySelector( '.domCanvas-camera' ) as HTMLElement;

		/*-------------------------------
			BackButton
		-------------------------------*/

		this.backBtnElm = document.querySelector( '.content-back-btn' ) as HTMLButtonElement;
		this.backBtnElm.addEventListener( 'click', () => {

			this.dispatchEvent( { type: 'close' } );

		} );

		/*-------------------------------
			Mesh
		-------------------------------*/

		this.mesh = contentMesh;

		this.mesh.material = new THREE.ShaderMaterial( {
			vertexShader: contentVert,
			fragmentShader: contentFrag,
			uniforms: this.commonUniforms,
			visible: false
		} );

		// calc size

		this.contentMeshSize = new THREE.Vector3();

		let ymem = this.mesh.rotation.y;
		this.mesh.rotation.y = 0;
		new THREE.Box3().setFromObject( this.mesh ).getSize( this.contentMeshSize );
		this.mesh.rotation.y = ymem;

		let elmSize = 450;
		this.contentElm.style.width = elmSize + 'px';
		this.contentElm.style.height = elmSize / ( this.contentMeshSize.x / this.contentMeshSize.y ) + 'px';

		/*-------------------------------
			Thumbnail
		-------------------------------*/

		this.thumbnail = new Thumbnail( this.commonUniforms );
		this.thumbnail.scale.setScalar( this.contentMeshSize.x * 0.7 );
		this.thumbnail.position.y = 0.6;
		this.mesh.add( this.thumbnail );

	}

	public open( contentName: string ) {

		this.viewing = true;

		let content = ContentDataList.find( item => {

			return item.title == contentName;

		} );

		if ( ! content ) return;

		this.setContentData( content );

		this.contentElm.setAttribute( 'data-content_visibility', 'true' );

	}

	private async setContentData( data: ContentData ) {

		let titleElm = this.contentElm.querySelector( '.content-title' ) as HTMLElement;
		titleElm.innerHTML = data.title;

		let descElm = this.contentElm.querySelector( '.content-desc' ) as HTMLElement;
		descElm.innerHTML = data.description;

		let linkWrapperElm = this.contentElm.querySelector( '.content-link' ) as HTMLElement;
		let aElm = linkWrapperElm.querySelector( 'a' ) as HTMLAnchorElement;
		aElm.href = data.link;

		( aElm.querySelector( 'span' ) as HTMLSpanElement ).innerText = data.linkDisplay;

		this.thumbnail.open( data.images );

	}

	public close() {

		this.viewing = false;

		this.contentElm.setAttribute( 'data-content_visibility', 'false' );

		this.thumbnail.close();

		this.animator.animate( 'contentInfoVisibility', 1, 1, () => {

		} );

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
		this.contentElm.style.transform = this.getObjectCSSMatrix( this.mesh.matrixWorld.multiply( new THREE.Matrix4().makeScale( 1.0 / this.contentElm.clientWidth * this.contentMeshSize.x, 1.0 / this.contentElm.clientHeight * this.contentMeshSize.y, 1.0 ) ) );

		this.thumbnail.update( deltaTime );

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
