import * as THREE from 'three';
import * as ORE from 'ore-three-ts';

import { PowerMesh } from 'power-mesh';

import faceVert from './shaders/face.vs';
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
			vertexShader: faceVert,
			uniforms: uni
		}, true );

	}

	public set turing( value: THREE.Texture ) {

		this.commonUniforms.turingTex.value = value;

	}

}
