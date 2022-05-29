import * as THREE from 'three';
import * as ORE from 'ore-three';

import { ContentMesh } from '..';

import recollectionVert from './shaders/recollection.vs';
import recollectionFrag from './shaders/recollection.fs';

import passThroughFrag from './shaders/passThrough.fs';

export class Recollection extends ContentMesh {

	public mesh: THREE.Mesh;

	private sceneRenderTarget: THREE.WebGLRenderTarget;
	private passThrough?: ORE.PostProcessing;

	constructor( mesh: THREE.Mesh, parentUniforms: ORE.Uniforms ) {

		super( 'recollection', parentUniforms );

		this.colorOffset = 0.3;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
			backTex: {
				value: null
			},
			winResolution: {
				value: new THREE.Vector2()
			},
			noiseTex: window.gManager.assetManager.getTex( 'noise' )
		} );

		/*-------------------------------
			RenderTarget
		-------------------------------*/

		this.sceneRenderTarget = new THREE.WebGLRenderTarget( 1, 1 );

		/*-------------------------------
			Mesh
		-------------------------------*/

		this.mesh = mesh;
		this.mesh.material = new THREE.ShaderMaterial( {
			vertexShader: recollectionVert,
			fragmentShader: recollectionFrag,
			uniforms: this.commonUniforms,
			transparent: true,
		} );

		this.mesh.name = this.name + '/mesh';

		this.add( this.mesh );

		this.mesh.onBeforeRender = ( renderer, scene, camera ) => {

			if ( ! this.passThrough ) {

				this.passThrough = new ORE.PostProcessing( renderer, {
					fragmentShader: passThroughFrag,
				} );

			}

			let currentRenderTarget = renderer.getRenderTarget();

			if ( currentRenderTarget ) {

				this.passThrough.render( { tex: currentRenderTarget.texture }, this.sceneRenderTarget );

				this.commonUniforms.backTex.value = this.sceneRenderTarget.texture;

			}

		};

	}

	public update( deltaTime: number ) {

		super.update( deltaTime );

		this.mesh.rotateX( deltaTime * 0.1 );
		this.mesh.rotateY( deltaTime * 0.24 );

	}

	public resize( layerInfo: ORE.LayerInfo ) {

		super.resize( layerInfo );

		let size = layerInfo.size.canvasPixelSize.clone().multiplyScalar( 0.4 );
		this.sceneRenderTarget.setSize( size.x, size.y );

		this.commonUniforms.winResolution.value.copy( layerInfo.size.canvasPixelSize );

	}

}
