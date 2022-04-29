import * as THREE from 'three';
import * as ORE from 'ore-three-ts';
import { Background } from './Background';
import { Floor } from './Floor';

export class World extends THREE.Object3D {

	private scene: THREE.Scene;
	private commonUniforms: ORE.Uniforms;

	private background: Background;

	private floor: Floor;

	constructor( scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		super();

		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Light
		-------------------------------*/

		let light = new THREE.DirectionalLight();
		light.position.set( - 4, 2, 1 );
		light.intensity = 0.8;
		light.castShadow = true;
		light.shadow.mapSize.set( 1024, 1024 );
		this.scene.add( light );

		/*-------------------------------
			Background
		-------------------------------*/

		this.background = new Background( this.commonUniforms );
		this.scene.add( this.background );

		/*-------------------------------
			Floor
		-------------------------------*/

		this.floor = new Floor( this.scene.getObjectByName( 'Floor' ) as THREE.Mesh, this.commonUniforms );



	}

	public update( deltaTime: number ) {

	}

}
