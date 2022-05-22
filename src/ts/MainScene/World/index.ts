import * as THREE from 'three';
import * as ORE from 'ore-three';
import { Background } from './Background';
import { Floor } from './Floor';
import { BackNoise } from './BackNoise';
import { PowerMesh } from 'power-mesh';
import { Triangle } from './Triangle';
import { Trail } from './Trail';
import { Particles } from './Particles';
import { Ring } from './Ring';
import { Content } from './Content';
import { ContentMesh } from './ContentMesh';
import { UKONPOWER } from './ContentMesh/UKONPOWER';

export class World extends THREE.Object3D {

	private renderer: THREE.WebGLRenderer;
	private scene: THREE.Scene;
	private commonUniforms: ORE.Uniforms;

	private animator: ORE.Animator;

	private background: Background;

	private customRoot: THREE.Object3D;
	private commonRoot: THREE.Object3D;
	private contentMeshRoot: THREE.Object3D;

	//  custom mesh

	public backNoise: BackNoise;
	public floor: Floor;
	public triangle: Triangle;
	public trail: Trail;
	public particles: Particles;
	public ring: Ring;

	// content mesh

	public ukonpower: UKONPOWER;

	public contentMeshList: ContentMesh[] = [];

	// powermesh

	private powerMeshAll: PowerMesh[] = [];

	// content

	public content: Content;

	constructor( renderer: THREE.WebGLRenderer, scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		super();

		this.renderer = renderer;
		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		/*-------------------------------
			Roots
		-------------------------------*/

		this.commonRoot = this.scene.getObjectByName( 'Common' ) as THREE.Object3D;
		this.customRoot = this.scene.getObjectByName( 'Custom' ) as THREE.Object3D;
		this.contentMeshRoot = this.scene.getObjectByName( 'ContentMesh' ) as THREE.Object3D;

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

		this.ukonpower = new UKONPOWER( this.renderer, this.contentMeshRoot.getObjectByName( 'UKONPOWER' ) as THREE.Mesh, this.commonUniforms );
		this.contentMeshRoot.add( this.ukonpower );
		this.powerMeshAll.push( this.ukonpower.face );

		this.ukonpower.addEventListener( 'click', ( e ) => {

			this.dispatchClick( 'content', e.name );

		} );

		this.powerMeshAll.push( this.ukonpower.face );

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
			Ring
		-------------------------------*/

		this.ring = new Ring( this.customRoot.getObjectByName( "Ring" ) as THREE.Mesh, this.commonUniforms );
		this.powerMeshAll.push( this.ring );

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

		/*-------------------------------
			Content
		-------------------------------*/

		this.content = new Content( this.customRoot.getObjectByName( 'Content' )as THREE.Mesh, this.commonUniforms );
		this.add( this.content );

	}

	public update( deltaTime: number, time: number, camera: THREE.PerspectiveCamera ) {

		/*-------------------------------
			Trail
		-------------------------------*/

		this.trail.update( deltaTime );

		/*-------------------------------
			ukonpower
		-------------------------------*/

		this.ukonpower.update( deltaTime );

		/*-------------------------------
			Content
		-------------------------------*/

		this.content.update( deltaTime, camera );

	}

	public resize( layerInfo: ORE.LayerInfo ) {

		this.content.resize( layerInfo );

	}

	public updateEnvMap( envMap: THREE.CubeTexture ) {

		this.powerMeshAll.forEach( item => {

			item.updateEnvMap( envMap );

		} );

		this.trail.updateEnvMap( envMap );

	}

	private dispatchClick( clickType: string, meshName: string ) {

		this.dispatchEvent( {
			type: 'click',
			clickType,
			meshName
		} );

	}

}
