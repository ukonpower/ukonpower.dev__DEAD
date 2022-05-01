import * as THREE from 'three';
import * as ORE from 'ore-three-ts';

import triangleVert from './shaders/triangle.vs';
import triangleFrag from './shaders/triangle.fs';

export class Triangle {

	private commonUniforms: ORE.Uniforms;
	private mesh: THREE.Mesh;

	constructor( mesh: THREE.Mesh, uniforms: ORE.Uniforms ) {

		this.mesh = mesh;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( uniforms, {
		} );

		this.mesh.material = new THREE.ShaderMaterial( {
			vertexShader: triangleVert,
			fragmentShader: triangleFrag,
			uniforms: this.commonUniforms,
			blending: THREE.CustomBlending,
			blendSrc: THREE.OneMinusDstColorFactor,
			transparent: true,
		} );

	}

}
