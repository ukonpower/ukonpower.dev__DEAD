import * as THREE from 'three';
import * as ORE from 'ore-three-ts';

import backgroundVert from './shaders/background.vs';
import backgroundFrag from './shaders/background.fs';

export class Background extends THREE.Mesh {

	private uniforms: ORE.Uniforms;

	constructor( parentUniforms: ORE.Uniforms ) {

		let uniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {} );

		let geo = new THREE.BoxBufferGeometry( 100.0, 100.0, 100.0 );
		let mat = new THREE.ShaderMaterial( {
			vertexShader: backgroundVert,
			fragmentShader: backgroundFrag,
			uniforms: uniforms,
			depthWrite: false,
			depthTest: false,
			side: THREE.BackSide
		} );

		super( geo, mat );

		this.renderOrder = - 99999;
		this.uniforms = uniforms;

	}

}
