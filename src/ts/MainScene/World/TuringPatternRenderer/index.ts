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
	private datas: ORE.GPUcomputationData;

	private params = {
		f: 0.022,
		k: 0.051
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

		this.gCon = new ORE.GPUComputationController( renderer, new THREE.Vector2( 256, 256 ) );

		this.datas = this.gCon.createData( this.setInitData( this.gCon.createInitializeTexture() ) );

		this.kernel = this.gCon.createKernel( {
			fragmentShader: turingPattern,
			uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
				backBuffer: {
					value: null
				},
				f: {
					value: 0
				},
				k: {
					value: 0
				}
			} )
		} );


		/*-------------------------------
			Pane
		-------------------------------*/

		let pane = new Pane();

		pane.addInput( this.params, 'f', {
			min: 0, max: 0.1
		} ).on( 'change', ( e ) => {

			this.kernel.uniforms.f.value = e.value;

		} );

		pane.addInput( this.params, 'k', {
			min: 0, max: 0.1
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

				texture.image.data[ index + 0 ] = Math.random();
				texture.image.data[ index + 1 ] = Math.random();
				texture.image.data[ index + 2 ] = 0.0;
				texture.image.data[ index + 3 ] = 0.0;


			}

    	}

		return texture;

	}

	public update( deltaTime: number ) {

		this.kernel.uniforms.backBuffer.value = this.datas.buffer.texture;
		this.gCon.compute( this.kernel, this.datas );

		this.commonUniforms.tex.value = this.datas.buffer.texture;

	}

}
