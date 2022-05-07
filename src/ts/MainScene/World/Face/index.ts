import * as THREE from 'three';
import * as ORE from 'ore-three-ts';

import { PowerMesh } from 'power-mesh';

import faceFrag from './shaders/face.fs';

export class Face extends PowerMesh {

	constructor( mesh: THREE.Mesh, parentUniforms: ORE.Uniforms ) {

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			turingTex: {
				value: null
			}
		} );

		super( mesh, {
			fragmentShader: faceFrag,
			uniforms: uni
		}, true );

	}

	public set turing( value: THREE.Texture ) {

		this.commonUniforms.turingTex.value = value;

	}

}
