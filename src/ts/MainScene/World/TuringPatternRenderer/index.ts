import * as THREE from 'three';
import * as ORE from 'ore-three-ts';

import turingPattern from './shaders/turingPattern.glsl';

import planeVert from './shaders/plane.vs';
import planeFrag from './shaders/plane.fs';
import { Pane } from 'tweakpane';

export class TuringPatternRenderer extends THREE.Object3D {

	private renderer: THREE.WebGLRenderer;
	private commonUniforms: ORE.Uniforms;

	private gCon: ORE.GPUComputationController;
	private kernel: ORE.GPUComputationKernel;
	private state: ORE.GPUcomputationData;

	public texture: THREE.Texture;

	private params = {
		f: 0.02576,
		k: 0.0570
	};

	constructor( renderer: THREE.WebGLRenderer, parentUniforms: ORE.Uniforms ) {

		super();

		this.renderer = renderer;
		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			tex: {
				value: null
			}
		} );

		/*-------------------------------
			GPUController
		-------------------------------*/

		this.gCon = new ORE.GPUComputationController( renderer, new THREE.Vector2( 128, 128 ) );

		this.state = this.gCon.createData( this.setInitData( this.gCon.createInitializeTexture() ), {
			magFilter: THREE.LinearFilter,
			minFilter: THREE.LinearFilter,
		} );

		this.texture = this.state.buffer.texture;

		this.kernel = this.gCon.createKernel( {
			fragmentShader: turingPattern,
			uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
				backBuffer: {
					value: null
				},
				f: {
					value: this.params.f
				},
				k: {
					value: this.params.k
				}
			} )
		} );

		/*-------------------------------
			Pane
		-------------------------------*/

		let pane = new Pane();

		pane.addInput( this.params, 'f', {
			min: 0.02, max: 0.09, step: 0.0001
		} ).on( 'change', ( e ) => {

			this.kernel.uniforms.f.value = e.value;

		} );

		pane.addInput( this.params, 'k', {
			min: 0.04, max: 0.08, step: 0.0001
		} ).on( 'change', ( e ) => {

			this.kernel.uniforms.k.value = e.value;

		} );

		/*-------------------------------
			Mesh
		-------------------------------*/

		let mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2.0, 2.0 ), new THREE.ShaderMaterial( {
			vertexShader: planeVert,
			fragmentShader: planeFrag,
			uniforms: this.commonUniforms
		} ) );

		this.add( mesh );

	}

	private setInitData( texture: THREE.DataTexture ) {

    	for ( let i = 0; i < texture.image.height; i ++ ) {

			for ( let j = 0; j < texture.image.width; j ++ ) {

				let index = ( i * texture.image.width + j ) * 4;

				let p = new THREE.Vector2( j / texture.image.width, i / texture.image.height );
				p.add( new THREE.Vector2( - 0.2, - 1.0 ) );
				let d = 1.0 - ORE.Easings.smoothstep( 0.1, 0.11, p.length() );

				texture.image.data[ index + 0 ] = 1 - d * 0.8 * Math.random();
				texture.image.data[ index + 1 ] = 0 + d * 0.25 * Math.random();
				texture.image.data[ index + 2 ] = 0.0;
				texture.image.data[ index + 3 ] = 0.0;

			}

    	}

		return texture;

	}

	public update( deltaTime: number ) {

		for ( let i = 0; i < 30; i ++ ) {

			this.kernel.uniforms.backBuffer.value = this.state.buffer.texture;

			this.gCon.compute( this.kernel, this.state );

			this.commonUniforms.tex.value = this.state.buffer.texture;

		}

		this.texture = this.state.buffer.texture;

	}

}
