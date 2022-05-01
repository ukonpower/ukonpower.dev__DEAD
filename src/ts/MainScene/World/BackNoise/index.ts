import * as THREE from 'three';
import * as ORE from 'ore-three-ts';

import backNoiseVert from './shaders/backNoise.vs';
import backNoiseFrag from './shaders/backNoise.fs';

export class BackNoise {

	private commonUniforms: ORE.Uniforms;
	private mesh: THREE.Mesh;

	constructor( mesh: THREE.Mesh, parentUniforms: ORE.Uniforms ) {

		this.mesh = mesh;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		this.mesh.material = new THREE.ShaderMaterial( {
			fragmentShader: backNoiseFrag,
			vertexShader: backNoiseVert,
			uniforms: this.commonUniforms
		} );

	}

}
