import * as THREE from 'three';
import * as ORE from 'ore-three';

import { ContentMesh } from '..';

import oreglVert from './shaders/oregl.vs';
import oreglFrag from './shaders/oregl.fs';

export class OreGL extends ContentMesh {

	private oreGlMesh: THREE.Mesh;
	private sceneRenderTarget: THREE.WebGLRenderTarget;

	constructor( parentUniforms: ORE.Uniforms ) {

		super( 'oregl', parentUniforms );

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
		} );

		/*-------------------------------
			RenderTarget
		-------------------------------*/

		this.sceneRenderTarget = new THREE.WebGLRenderTarget( 1, 1 );

		/*-------------------------------
			Mesh
		-------------------------------*/

		this.oreGlMesh = new THREE.Mesh( new THREE.SphereBufferGeometry( 2, 30, 30 ), new THREE.ShaderMaterial( {
			vertexShader: oreglVert,
			fragmentShader: oreglFrag,
			uniforms: this.commonUniforms,
			transparent: true,
		} ) );

		this.oreGlMesh.name = this.name + '/mesh';

		this.add( this.oreGlMesh );


	}

	public update( deltaTime: number ) {
	}

	public resize( layerInfo: ORE.LayerInfo ) {

		super.resize( layerInfo );

	}

}
