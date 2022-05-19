import * as THREE from 'three';
import * as ORE from 'ore-three';
import { PowerMesh } from 'power-mesh';

import ringVert from './shaders/ring.vs';

export class Ring extends PowerMesh {

	public root: THREE.Object3D;

	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		let baseMesh = root.children[ 0 ] as THREE.Mesh;
		root.remove( baseMesh );

		/*-------------------------------
			Create Mesh
		-------------------------------*/

		let geo = new THREE.InstancedBufferGeometry();
		geo.setAttribute( 'position', baseMesh.geometry.getAttribute( 'position' ) );
		geo.setAttribute( 'uv', baseMesh.geometry.getAttribute( 'uv' ) );
		geo.setAttribute( 'normal', baseMesh.geometry.getAttribute( 'normal' ) );
		geo.setIndex( baseMesh.geometry.getIndex() );

		geo.getAttribute( 'position' ).applyMatrix4( new THREE.Matrix4().makeTranslation( 0.0, 0.0, - 5.5 ) );

		let num = 18;

		let numArray = [];

		for ( let i = 0; i < num; i ++ ) {

			numArray.push( i / num );

		}

		geo.setAttribute( 'num', new THREE.InstancedBufferAttribute( new Float32Array( numArray ), 1 ) );

		super( new THREE.Mesh( geo, baseMesh.material ), {
			vertexShader: ringVert,
			uniforms: ORE.UniformsLib.mergeUniforms( parentUniforms, {} ),
		} );

		this.root = root;
		this.root.add( this );

	}

	public update( deltaTime: number ) {

	}

}
