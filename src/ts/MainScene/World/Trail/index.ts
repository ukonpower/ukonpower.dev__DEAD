import * as THREE from 'three';
import * as ORE from 'ore-three';

import comPosition from './shaders/trailComputePosition.glsl';
import comVelocity from './shaders/trailComputeVelocity.glsl';

import trailVert from './shaders/trail.vs';
import trailFrag from './shaders/trail.fs';

import { PowerMesh } from 'power-mesh';

declare interface Kernels{
    velocity: ORE.GPUComputationKernel,
    position: ORE.GPUComputationKernel
}

declare interface Datas{
    velocity: ORE.GPUcomputationData,
    position: ORE.GPUcomputationData
}

export class Trail extends PowerMesh {

	private renderer: THREE.WebGLRenderer;

	private animator: ORE.Animator;

	private num: number;
	private length: number;

	private gCon: ORE.GPUComputationController;
	private kernels: Kernels;
	private datas: Datas;

	private meshUniforms: ORE.Uniforms;

	constructor( renderer: THREE.WebGLRenderer, num: number, length: number, parentUniforms: ORE.Uniforms ) {

		let commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			deltaTime: {
				value: 1
			},
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		let animator = window.gManager.animator;

		commonUniforms.oregl = animator.add( {
			name: 'trailOreGL',
			initValue: 0
		} );

		/*-------------------------------
			CreateTrails
		-------------------------------*/

		let geo = new THREE.InstancedBufferGeometry();

		let posArray = [];
		let indexArray = [];
		let normalArray = [];
		let uvXArray = [];
		let uvYArray = [];

		let r = .3;
		let res = 8;
		for ( let j = 0; j < length; j ++ ) {

			let cNum = j;
			for ( let k = 0; k < res; k ++ ) {

				let rad = Math.PI * 2 / res * k;
				let x = Math.cos( rad ) * r;
				let y = Math.sin( rad ) * r;
				let z = j * 1.6;
				z = 0;

				posArray.push( x );
				posArray.push( y );
				posArray.push( z );

				let nml = new THREE.Vector3( x, y, z );
				nml.normalize();

				normalArray.push( nml.x, nml.y, nml.z );

				uvXArray.push( j / length );

				let c = cNum * res + k;
				if ( j > 0 ) {

					indexArray.push( c );
					indexArray.push( ( ( cNum - 1 ) * ( res ) + ( k + 1 ) % res ) );
					indexArray.push( ( cNum * res + ( ( k + 1 ) % res ) ) );

					indexArray.push( c );
					indexArray.push( c - res );
					indexArray.push( ( ( cNum - 1 ) * res + ( ( k + 1 ) % res ) ) );

				}

			}

		}

		let pos = new Float32Array( posArray );
		let normal = new Float32Array( normalArray );
		let uvx = new Float32Array( uvXArray );
		let indices = new Uint16Array( indexArray );

		geo.setAttribute( 'position', new THREE.BufferAttribute( pos, 3 ) );
		geo.setAttribute( 'uvx', new THREE.BufferAttribute( uvx, 1 ) );
		geo.setAttribute( 'normal', new THREE.BufferAttribute( normal, 3 ) );
		geo.setIndex( new THREE.BufferAttribute( indices, 1 ) );

		//instanecing attribute

		for ( let i = 0; i < num; i ++ ) {

			uvYArray.push( i / num );

		}

		let uvy = new Float32Array( uvYArray );
		geo.setAttribute( 'uvy', new THREE.InstancedBufferAttribute( uvy, 1, false, 1 ) );

		let meshUniforms = ORE.UniformsLib.mergeUniforms( commonUniforms, {
			dataPos: {
				value: null
			},
			dataVel: {
				value: null
			} }
		);

		/*-------------------------------
			Super
		-------------------------------*/

		super( geo, {
			vertexShader: trailVert,
			fragmentShader: trailFrag,
			uniforms: meshUniforms
		} );

		this.animator = animator;

		this.commonUniforms.metalness.value = 0.0;
		this.commonUniforms.roughness.value = 0.0;
		this.commonUniforms.color.value.set( "#FFF" );
		this.envMapIntensity = 0.2;

		this.renderer = renderer;

		this.num = num;
		this.length = length;

		this.meshUniforms = meshUniforms;

		/*-------------------------------
			GPU Controller
		-------------------------------*/

		this.gCon = new ORE.GPUComputationController( renderer, new THREE.Vector2( length, num ) );

		// create computing position kernel

		let posUni = ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
			dataPos: { value: null },
			dataVel: { value: null },
		} );

		let posKernel = this.gCon.createKernel( {
			fragmentShader: comPosition,
			uniforms: posUni
		} );

		// create computing velocity kernel

		let velUni = ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
			dataPos: { value: null },
			dataVel: { value: null },
			seed: {
				value: Math.random() * 100
			}
		} );

		let velKernel = this.gCon.createKernel( {
			fragmentShader: comVelocity,
			uniforms: velUni
		} );

		// matomeru

		this.kernels = {
			position: posKernel,
			velocity: velKernel,
		};

		this.datas = {
			position: this.gCon.createData( this.createInitialPositionData() ),
			velocity: this.gCon.createData(),
		};

		this.frustumCulled = false;

	}

	private createInitialPositionData() {

    	let dataArray: number[] = [];

    	for ( let i = 0; i < this.num; i ++ ) {

			let r = Math.random() * Math.PI * 1.0 - Math.PI / 2.0;

			let pos = [
				Math.sin( r ) * 10.0,
				( Math.random() - 0.5 ) * 10.0 + 5.0,
				Math.cos( r ) * 10.0,
				0,
			];

    		for ( let j = 0; j < this.length; j ++ ) {


				pos.forEach( item => {

					dataArray.push( item );

				} );

    		}

    	}

    	let tex = new THREE.DataTexture( new Float32Array( dataArray ), this.length, this.num, THREE.RGBAFormat, THREE.FloatType );
		tex.needsUpdate = true;
		return tex;

	}

	public update( deltaTime: number ) {

		this.commonUniforms.deltaTime.value = deltaTime;

		this.kernels.velocity.uniforms.dataPos.value = this.datas.position.buffer.texture;
		this.kernels.velocity.uniforms.dataVel.value = this.datas.velocity.buffer.texture;
		this.gCon.compute( this.kernels.velocity, this.datas.velocity );

		this.kernels.position.uniforms.dataPos.value = this.datas.position.buffer.texture;
		this.kernels.position.uniforms.dataVel.value = this.datas.velocity.buffer.texture;
		this.gCon.compute( this.kernels.position, this.datas.position );

		this.meshUniforms.dataPos.value = this.datas.position.buffer.texture;
		this.meshUniforms.dataVel.value = this.datas.velocity.buffer.texture;

	}

	public switchOreGL( oregl: boolean ) {

		this.animator.animate( 'trailOreGL', oregl ? 1 : 0, 2 );

	}

}
