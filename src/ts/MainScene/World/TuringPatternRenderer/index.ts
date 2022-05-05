import * as THREE from 'three';
import * as ORE from 'ore-three-ts';

import turingPattern from './shaders/turingPattern.glsl';

import planeVert from './shaders/plane.vs';
import planeFrag from './shaders/plane.fs';

export class TuringPatternRenderer extends THREE.Object3D {

	private renderer: THREE.WebGLRenderer;
	private commonUniforms: ORE.Uniforms;

	private gCon: ORE.GPUComputationController;
	private kernel: ORE.GPUComputationKernel;
	private datas: ORE.GPUcomputationData;

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

		this.gCon = new ORE.GPUComputationController( renderer, new THREE.Vector2( 100, 100 ) );

		this.datas = this.gCon.createData();

		this.kernel = this.gCon.createKernel( {
			fragmentShader: turingPattern,
			uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
				backBuffer: {
					value: null
				}
			} )
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

	public update( deltaTime: number ) {

		this.kernel.uniforms.backBuffer.value = this.datas.buffer.texture;

		this.gCon.compute( this.kernel, this.datas );

		this.commonUniforms.tex.value = this.datas.buffer.texture;

	}

}
