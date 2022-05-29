import * as THREE from 'three';
import * as ORE from 'ore-three';

import particlesVert from './shaders/contentParticles.vs';
import particlesFrag from './shaders/contentParticles.fs';

export class ContentParticles extends THREE.Points {

	private commonUniforms: ORE.Uniforms;

	constructor( parentUniforms?: ORE.Uniforms ) {

		let range = new THREE.Vector2( 3.0, 5 );

		let num = 20;
		let offsetPosArray: number[] = [];
		let numArray: number[] = [];
		let rndArray: number[] = [];

		let length = 70;

		for ( let i = 0; i < num; i ++ ) {

			let r = Math.random() * Math.PI * 2.0;
			let radius = ( 0.5 + Math.sin( i / num * Math.PI ) * 0.5 + ( Math.random() - 0.5 ) * 0.2 ) * range.x;

			let x = Math.cos( r ) * radius;
			let y = i / num * range.y;
			let z = Math.sin( r ) * radius;

			let rnd = Math.random();

			for ( let j = 0; j < length; j ++ ) {

				offsetPosArray.push(
					x, y, z,
				);

				rndArray.push( rnd );
				numArray.push( i / num, j / length );

			}

		}

		let geo = new THREE.BufferGeometry();
		geo.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( offsetPosArray ), 3 ) );
		geo.setAttribute( 'num', new THREE.BufferAttribute( new Float32Array( numArray ), 2 ) );
		geo.setAttribute( 'rnd', new THREE.BufferAttribute( new Float32Array( rndArray ), 1 ) );

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			range: {
				value: range
			},
			particleSize: {
				value: 1.0
			},
			colorOffset: {
				value: 0.0
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

	public setColorOffset( value: number ) {

		this.commonUniforms.colorOffset.value = value;

	}

	public resize( layerInfo: ORE.LayerInfo ) {

		this.commonUniforms.particleSize.value = layerInfo.size.windowSize.y / 50;

	}

}
