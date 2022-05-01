import * as THREE from 'three';
import * as ORE from 'ore-three-ts';
import { PowerReflectionMesh } from 'power-mesh';

import floorVert from './shaders/floor.vs';

export class Floor extends PowerReflectionMesh {

	constructor( baseMesh: THREE.Mesh, uniforms: ORE.Uniforms ) {

		super( baseMesh, {
			vertexShader: floorVert,
			uniforms: uniforms
		}, true );

	}

}
