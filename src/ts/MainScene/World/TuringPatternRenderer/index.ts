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
	public size: THREE.Vector2 = new THREE.Vector2( 128, 128 );

	private pane: Pane;
	private params = {
		f: 0.0258,
		k: 0.0517
	};

	private animator: ORE.Animator;

	constructor( renderer: THREE.WebGLRenderer, parentUniforms: ORE.Uniforms ) {

		super();

		this.renderer = renderer;
		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			tex: {
				value: null
			},
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.noiseX = this.animator.add( {
			name: 'turingNoiseX',
			initValue: new THREE.Vector2( 1.0, 1.0 )
		} );

		this.commonUniforms.noiseY = this.animator.add( {
			name: 'turingNoiseY',
			initValue: new THREE.Vector2( 1.0, 1.0 )
		} );

		/*-------------------------------
			GPUController
		-------------------------------*/

		this.gCon = new ORE.GPUComputationController( renderer, this.size );

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

		this.pane = new Pane();

		this.pane.addInput( this.params, 'f', {
			min: 0.02, max: 0.09, step: 0.0001
		} ).on( 'change', ( e ) => {

			this.kernel.uniforms.f.value = e.value;

		} );

		this.pane.addInput( this.params, 'k', {
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
				p.add( new THREE.Vector2( - 0.5, - 0.6 ) );
				let d = ORE.Easings.smoothstep( 0.49, 0.5, p.length() );

				texture.image.data[ index + 0 ] = 1 - d * 0.8 * Math.random();
				texture.image.data[ index + 1 ] = 0 + d * 0.25 * Math.random();
				texture.image.data[ index + 2 ] = 0.0;
				texture.image.data[ index + 3 ] = 0.0;

			}

    	}

		return texture;

	}

	public update( deltaTime: number ) {

		for ( let i = 0; i < 5; i ++ ) {

			this.kernel.uniforms.backBuffer.value = this.state.buffer.texture;

			this.gCon.compute( this.kernel, this.state );

			this.commonUniforms.tex.value = this.state.buffer.texture;

		}

		this.texture = this.state.buffer.texture;

	}

	public set feed( value: number ) {

		this.params.f = value;

		this.pane.refresh();

	}

	public set kill( value: number ) {

		this.params.k = value;

		this.pane.refresh();

	}

	public noise( duration: number = 5.0 ) {

		this.animator.animate( 'turingNoiseX', new THREE.Vector2( Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 0.5 ), duration );
		this.animator.animate( 'turingNoiseY', new THREE.Vector2( Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 0.5 ), duration );

	}

}
