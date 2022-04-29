import * as THREE from 'three';
import * as ORE from 'ore-three-ts';
import { PowerReflectionMesh } from 'powermesh';

export class Floor extends PowerReflectionMesh {

	constructor( baseMesh: THREE.Mesh, uniforms: ORE.Uniforms ) {

		super( baseMesh, {
			uniforms: uniforms
		} );

	}

}
