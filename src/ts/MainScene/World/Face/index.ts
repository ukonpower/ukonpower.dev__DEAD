import * as THREE from 'three';
import * as ORE from 'ore-three';

import { PowerMesh } from 'power-mesh';

import faceVert from './shaders/face.vs';
import faceFrag from './shaders/face.fs';

export class Face extends PowerMesh {

	private animator: ORE.Animator;

	constructor( mesh: THREE.Mesh, parentUniforms: ORE.Uniforms ) {

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			turingTex: {
				value: null
			}
		} );

		let animator = window.gManager.animator;

		uni.noise = animator.add( {
			name: 'faceNoise',
			initValue: 0
		} );

		super( mesh, {
			fragmentShader: faceFrag,
			vertexShader: faceVert,
			uniforms: uni
		}, true );

		this.animator = animator;

	}

	public set turing( value: THREE.Texture ) {

		this.commonUniforms.turingTex.value = value;

	}

	public noise( duration: number = 5 ) {

		this.animator.animate( 'faceNoise', Math.random(), duration );

	}

}
