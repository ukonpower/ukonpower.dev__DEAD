import * as THREE from 'three';
import * as ORE from 'ore-three';

import thumbnailVert from './shaders/thumbnail.vs';
import thumbnailFrag from './shaders/thumbnail.fs';
import { ContentImgData } from '~/ts/data/content';

export class Thumbnail extends THREE.Object3D {

	private time: number = 0;

	private commonUniforms: ORE.Uniforms;

	private animator: ORE.Animator;
	private loader: THREE.TextureLoader;

	public textures: {tex: THREE.Texture, data: ContentImgData}[] = [];
	public index: number = 0;

	private meshNum: number = 5;
	private meshList: THREE.Mesh<THREE.PlaneBufferGeometry, THREE.ShaderMaterial>[] = [];

	public viewing: boolean = false;

	constructor( parentUniforms: ORE.Uniforms ) {

		super();

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.visibility = this.animator.add( {
			name: 'thumbVisibility',
			initValue: 0
		} );

		this.commonUniforms.blend = this.animator.add( {
			name: 'thumbBlend',
			initValue: 0
		} );

		/*-------------------------------
			Mesh
		-------------------------------*/

		let aspect = 3000 / 1800;
		let geo = new THREE.PlaneBufferGeometry( 1, 1.0 / aspect, 1.0, 1.0 );

		for ( let i = 0; i < this.meshNum; i ++ ) {

			let mat = new THREE.ShaderMaterial( {
				vertexShader: thumbnailVert,
				fragmentShader: thumbnailFrag,
				uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
					tex1: {
						value: null
					},
					tex2: {
						value: null
					},
				} ),
				transparent: true,
			} );

			let mesh = new THREE.Mesh( geo, mat );
			mesh.name = mesh.uuid;
			this.add( mesh );

			window.gManager.eRay.addEventListener( 'click/' + mesh.name, () => {

				let link = mesh.userData.texLink;

				if ( link ) {

					window.open( link, '_blank' );

				}

			} );


			mat.uniforms.offsetPos = {
				value: mesh.position
			};

			this.meshList.push( mesh );

			this.visible = false;

		}

		/*-------------------------------
			Loader
		-------------------------------*/

		this.loader = new THREE.TextureLoader();

	}

	/*-------------------------------
		Open / Close
	-------------------------------*/

	public async open( imgList: ContentImgData[] ) {

		let prms = imgList.map( item => {

			return new Promise<{tex:THREE.Texture, data: ContentImgData} | null>( ( resolve, reject ) => {

				const onClose = () => {

					this.removeEventListener( 'close', onClose );

					reject();

				};

				this.addEventListener( 'close', onClose );

				this.loader.load( item.url, ( tex ) => {

					resolve( { tex, data: item } );

					this.removeEventListener( 'close', onClose );

				}, undefined, () => {

					resolve( null );

					this.removeEventListener( 'close', onClose );

				} );

			} );

		} );

		try {

			let texList = await Promise.all( prms );

			this.textures.length = 0;

			texList.forEach( item => {

				if ( item ) {

					this.textures.push( item );

				}

			} );

			this.curerntImgIndex = - 1;

			this.meshList.forEach( ( item, index ) => {

				this.updateImg( index );

				window.gManager.eRay.addTouchableObject( item );

			} );

			this.viewing = true;

			this.visible = true;

			await this.animator.animate( 'thumbVisibility', 1, 2 );

		} catch {

			throw new Error( );

		}

	}

	public async close() {

		this.dispatchEvent( {
			type: 'close'
		} );

		this.meshList.forEach( ( item, index ) => {

			window.gManager.eRay.removeTouchableObject( item );

		} );

		await this.animator.animate( 'thumbVisibility', 0, 2 );

		this.visible = false;

		this.dispatchEvent( {
			type: 'closed'
		} );

	}

	private curerntImgIndex: number = - 1;

	private updateImg( meshIndex: number ) {

		if ( this.textures.length == 0 ) return;

		this.curerntImgIndex = ( this.curerntImgIndex + 1 ) % this.textures.length;

		let texData = this.textures[ this.curerntImgIndex ];

		let mesh = this.meshList[ meshIndex ];
		let uni = mesh.material.uniforms;
		uni.tex1.value = uni.tex2.value;
		uni.tex2.value = texData.tex;

		mesh.userData.texLink = texData.data.link;

	}

	public update( deltaTime: number ) {

		this.time += deltaTime;

		let t = this.time / this.meshList.length * 0.1;

		for ( let i = 0; i < this.meshList.length; i ++ ) {

			let mesh = this.meshList[ i ];

			let p = mesh.position.x;

			mesh.position.x = - ( ( ( t + i / this.meshList.length ) % 1 ) - 0.5 ) * ( this.meshList.length * 1.05 );

			if ( mesh.position.x > p ) {

				this.updateImg( i );

			}

		}

	}

}
