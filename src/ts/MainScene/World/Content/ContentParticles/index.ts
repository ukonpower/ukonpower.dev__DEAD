import * as THREE from 'three';
import * as ORE from 'ore-three';

import particlesVert from './shaders/contentParticles.vs';
import particlesFrag from './shaders/contentParticles.fs';

export class ContentParticles extends THREE.Points {

	private commonUniforms: ORE.Uniforms;

	constructor( parentUniforms?: ORE.Uniforms ) {

		let range = new THREE.Vector3( 5, 5, 5 );

		let num = 500;
		let offsetPosArray: number[] = [];
		let numArray: number[] = [];
		let rndArray: number[] = [];

		let length = 5;

		for ( let i = 0; i < num / length; i ++ ) {

			let x = Math.random() * range.x;
			let y = Math.random() * range.y;
			let z = Math.random() * range.z;

			for ( let j = 0; j < length; j ++ ) {
			}

			offsetPosArray.push(
				xyz,
			);

			numArray.push( i / num );
			rndArray.push( Math.random() );

		}

		let geo = new THREE.BufferGeometry();
		geo.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( offsetPosArray ), 3 ) );
		geo.setAttribute( 'num', new THREE.BufferAttribute( new Float32Array( numArray ), 1 ) );
		geo.setAttribute( 'rnd', new THREE.BufferAttribute( new Float32Array( rndArray ), 1 ) );

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			range: {
				value: range
			},
			particleSize: {
				value: 1.0
			}
		} );

		let mat = new THREE.ShaderMaterial( {
			vertexShader: particlesVert,
			fragmentShader: particlesFrag,
			uniforms: uni,
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthTest: true,
		} );

		super( geo, mat );

		this.commonUniforms = uni;

	}

	public resize( layerInfo: ORE.LayerInfo ) {

		this.commonUniforms.particleSize.value = layerInfo.size.windowSize.y / 50;

	}

}
