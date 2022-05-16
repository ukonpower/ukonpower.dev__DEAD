import * as THREE from 'three';
import * as ORE from 'ore-three';
import { Background } from './Background';
import { Floor } from './Floor';
import { BackNoise } from './BackNoise';
import { PowerMesh } from 'power-mesh';
import { Triangle } from './Triangle';
import { Trail } from './Trail';
import { Particles } from './Particles';
import { TuringPatternRenderer } from './TuringPatternRenderer';
import { Face } from './Face';

export class World extends THREE.Object3D {

	private renderer: THREE.WebGLRenderer;
	private scene: THREE.Scene;
	private commonUniforms: ORE.Uniforms;
	private animator: ORE.Animator;

	private background: Background;

	private customRoot: THREE.Object3D;
	private commonRoot: THREE.Object3D;

	//  custom mesh

	private backNoise: BackNoise;
	private floor: Floor;
	private face: Face;
	private triangle: Triangle;
	private trail: Trail;
	private particles: Particles;

	// turingpattern

	private turingPattern: TuringPatternRenderer;
	private turingPatternPreset: {feed: number, kill: number}[] = [
		{ feed: 0.0258, kill: 0.0517 },
		{ feed: 0.0421, kill: 0.0604 },
		{ feed: 0.0261, kill: 0.0604 },
		{ feed: 0.02, kill: 0.0504 },
	];

	// powermesh

	private powerMeshAll: PowerMesh[] = [];

	constructor( renderer: THREE.WebGLRenderer, scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		super();

		this.renderer = renderer;
		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			turingSize: {
				value: new THREE.Vector2()
			}
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		window.setInterval( () => {

			let setting = this.turingPatternPreset[ Math.floor( Math.random() * this.turingPatternPreset.length ) ];

			this.animator.animate( 'turingSetting', new THREE.Vector2( setting.feed, setting.kill ), 5 );
			this.turingPattern.noise( 5 );
			this.face.noise( 5 );

		}, 5000 );

		this.animator.add( {
			name: 'turingSetting',
			initValue: new THREE.Vector2( this.turingPatternPreset[ 0 ].feed, this.turingPatternPreset[ 0 ].kill )
		} );

		/*-------------------------------
			Roots
		-------------------------------*/

		this.commonRoot = this.scene.getObjectByName( 'Common' ) as THREE.Object3D;
		this.customRoot = this.scene.getObjectByName( 'Custom' ) as THREE.Object3D;

		/*-------------------------------
			Light
		-------------------------------*/

		let lightTarget = new THREE.Object3D();
		lightTarget.position.set( 0.0, 0.0, - 9.0 );
		this.scene.add( lightTarget );

		let light = new THREE.DirectionalLight();
		light.position.set( - 15, 20, 2 );
		light.target = lightTarget;
		light.intensity = 0.8;

		let shadowSize = 15.0;
		light.castShadow = true;
		light.shadow.camera.left = - shadowSize;
		light.shadow.camera.right = shadowSize;
		light.shadow.camera.top = shadowSize;
		light.shadow.camera.bottom = - shadowSize;
		light.shadow.camera.far = 35.0;
		light.shadow.bias = - 0.002;
		light.shadow.mapSize.set( 2048, 2048 );

		this.scene.add( light );

		// let lightHelper = new THREE.DirectionalLightHelper( light );
		// this.scene.add( lightHelper );

		// let cameraHelper = new THREE.CameraHelper( light.shadow.camera );
		// this.scene.add( cameraHelper );


		/*-------------------------------
			Background
		-------------------------------*/

		this.background = new Background( this.commonUniforms );
		this.scene.add( this.background );

		/*-------------------------------
			BackNoise
		-------------------------------*/

		this.backNoise = new BackNoise( this.customRoot.getObjectByName( 'BackNoise' ) as THREE.Mesh, this.commonUniforms );

		/*-------------------------------
			Floor
		-------------------------------*/

		this.floor = new Floor( this.customRoot.getObjectByName( 'Floor' ) as THREE.Mesh, this.commonUniforms );
		this.powerMeshAll.push( this.floor );

		/*-------------------------------
			Face
		-------------------------------*/

		this.face = new Face( this.customRoot.getObjectByName( 'Face' ) as THREE.Mesh, this.commonUniforms );
		this.powerMeshAll.push( this.face );

		/*-------------------------------
			Triangle
		-------------------------------*/

		this.triangle = new Triangle( this.customRoot.getObjectByName( 'Triangle' ) as THREE.Mesh, this.commonUniforms );

		/*-------------------------------
			Trail
		-------------------------------*/

		this.trail = new Trail( this.renderer, 30, 30, this.commonUniforms );
		this.trail.castShadow = true;
		this.trail.position.set( 0.0, 8.0, 5.0 );
		this.scene.add( this.trail );

		/*-------------------------------
			Particle
		-------------------------------*/

		this.particles = new Particles( this.commonUniforms );
		this.particles.position.set( 0.0, 1.0, 11.0 );
		this.particles.frustumCulled = false;
		this.scene.add( this.particles );

		/*-------------------------------
			Turing Pattern
		-------------------------------*/

		this.turingPattern = new TuringPatternRenderer( this.renderer, this.commonUniforms );
		this.commonUniforms.turingSize.value.copy( this.turingPattern.size );

		/*-------------------------------
			PowerMeshes
		-------------------------------*/

		let applyPowerMesh = ( objList: THREE.Object3D[] ) => {

			objList.forEach( item => {

				let mesh = item as THREE.Mesh;

				if ( mesh.isMesh ) {

					mesh = new PowerMesh( mesh, {
						uniforms: this.commonUniforms
					}, true );

					mesh.castShadow = true;
					mesh.receiveShadow = true;

					this.powerMeshAll.push( mesh as PowerMesh );

				}

				applyPowerMesh( mesh.children.slice() );

			} );

		};

		applyPowerMesh( this.commonRoot.children.slice() );

	}

	public update( deltaTime: number, time: number ) {

		/*-------------------------------
			Trail
		-------------------------------*/

		this.trail.update( deltaTime );

		/*-------------------------------
			TuringPattern
		-------------------------------*/


		if ( this.animator.isAnimatingVariable( 'turingSetting' ) ) {

			let turingSetting = this.animator.get( 'turingSetting' ) as THREE.Vector2;

			this.turingPattern.feed = turingSetting.x;
			this.turingPattern.kill = turingSetting.y;

		}

		this.turingPattern.update( deltaTime );

		this.face.turing = this.turingPattern.texture;
		this.face.rotation.y = Math.sin( time * 0.3 ) * 0.5;

	}

	public updateEnvMap( envMap: THREE.CubeTexture ) {

		this.powerMeshAll.forEach( item => {

			item.updateEnvMap( envMap );

		} );

		this.trail.updateEnvMap( envMap );

	}

}
