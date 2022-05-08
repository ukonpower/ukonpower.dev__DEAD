import * as THREE from 'three';
import * as ORE from 'ore-three-ts';

import { MSDFMesh } from '../../MSDFMesh';

import curveTextVert from './shaders/curveText.vs';
import curveTextFrag from './shaders/curveText.fs';

export class CurveTextMesh extends MSDFMesh {

	constructor( char: string, info: any, texture: THREE.Texture, height: number = 1, parentUniforms: ORE.Uniforms ) {

		let uniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			curveTime: {
				value: 0
			}
		} );

		super( char, info, texture, height, {
			vertexShader: curveTextVert,
			fragmentShader: curveTextFrag,
			transparent: true,
			uniforms: uniforms,
			stencilWrite: true,
			stencilFunc: THREE.NotEqualStencilFunc,
			stencilRef: 1,
		} );

		let whiteMat = new THREE.ShaderMaterial( {
			vertexShader: curveTextVert,
			fragmentShader: curveTextFrag,
			transparent: true,
			uniforms: this.uniforms,
			stencilWrite: true,
			stencilFunc: THREE.EqualStencilFunc,
			stencilRef: 1,
			defines: {
				'WHITE': ''
			}
		} );

		let whiteMesh = new THREE.Mesh( this.geometry, whiteMat );
		this.add( whiteMesh );

		this.renderOrder = 999;

		this.uniforms = uniforms;

	}

	public set curveTime( value: number ) {

		this.uniforms.curveTime.value = value;

	}

}
