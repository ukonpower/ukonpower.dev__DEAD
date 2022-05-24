import * as THREE from 'three';
import * as ORE from 'ore-three';

import { ContentMesh } from '..';

import recollectionVert from './shaders/recollection.vs';
import recollectionFrag from './shaders/recollection.fs';

export class Recollection extends ContentMesh {

	private recollectionMesh: THREE.Mesh;

	constructor( mesh: THREE.Mesh, parentUniforms: ORE.Uniforms ) {

		super( 'Recollection', parentUniforms );

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
		} );

		/*-------------------------------
			Mesh
		-------------------------------*/

		this.recollectionMesh = mesh;
		this.recollectionMesh.material = new THREE.ShaderMaterial( {
			vertexShader: recollectionVert,
			fragmentShader: recollectionFrag,
			uniforms: this.commonUniforms,
			transparent: true,
		} );

		this.recollectionMesh.name = 'recollection/mesh';

		this.add( this.recollectionMesh );

	}

	/*-------------------------------
		Update
	-------------------------------*/

	public update( deltaTime: number ) {
	}

}
