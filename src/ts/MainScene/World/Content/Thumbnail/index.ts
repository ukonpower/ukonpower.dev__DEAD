import * as THREE from 'three';
import * as ORE from 'ore-three';

import thumbnailVert from './shaders/thumbnail.vs';
import thumbnailFrag from './shaders/thumbnail.fs';

export class Thumbnail extends THREE.Object3D {

	private commonUniforms: ORE.Uniforms;

	private animator: ORE.Animator;
	private loader: THREE.TextureLoader;

	public textures: THREE.Texture[] = [];
	public index: number = 0;

	private meshList: THREE.Mesh[] = [];

	private commonGeo: THREE.BufferGeometry;

	constructor( parentUniforms: ORE.Uniforms ) {

		super();

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		let animator = window.gManager.animator;

		uni.blend = animator.add( {
			name: 'thumbnailBlend',
			initValue: 0
		} );

		/*-------------------------------
			Geo / Mat
		-------------------------------*/

		let aspect = 3000 / 1800;
		this.commonGeo = new THREE.PlaneBufferGeometry( 1.0, 1.0 / aspect );

		this.animator = animator;
		this.commonUniforms = uni;
		this.loader = new THREE.TextureLoader();

	}

	public async setImgs( imgList: string[] ) {

		let prms = imgList.map( item => {

			return new Promise<THREE.Texture | null>( ( resolve ) => {

				this.loader.load( item, ( tex ) => {

					resolve( tex );

				}, undefined, () => {

					resolve( null );

				} );

			} );

		} );

		let texList = await Promise.all( prms );

		this.textures.length = 0;

		texList.forEach( item => {

			if ( item ) {

				this.textures.push( item );

			}

		} );

		this.textures.forEach( ( item, index ) => {

			let uni = ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
				tex: {
					value: item
				},
				total: {
					value: this.textures.length
				},
				offset: {
					value: index
				}
			} );

			let mat = new THREE.ShaderMaterial( {
				vertexShader: thumbnailVert,
				fragmentShader: thumbnailFrag,
				uniforms: uni,
				transparent: true,
			} );

			let thumbMesh = new THREE.Mesh( this.commonGeo, mat );
			// thumbMesh.position.x = ( index - this.textures.length / 2 ) * 1.1;
			this.add( thumbMesh );

			this.meshList.push( thumbMesh );

		} );

	}

	public show( index: number ) {

		// this.index = index;

		// this.commonUniforms.tex1.value = this.commonUniforms.tex2.value;
		// this.commonUniforms.tex2.value = this.textures[ index ];

		// this.animator.setValue( 'thumbnailBlend', 0 );
		// this.animator.animate( 'thumbnailBlend', 1, 2 );

	}

}
