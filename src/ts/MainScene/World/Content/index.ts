import * as THREE from 'three';
import * as ORE from 'ore-three';
import { ContentInfo } from './ContentInfo';
import { UKONPOWER } from './ContentMesh/UKONPOWER';
import { ContentMesh } from './ContentMesh';
import { Recollection } from './ContentMesh/Recollection';
import { ContentControls } from './ContentControls';
import { OreGL } from './ContentMesh/OreGL';
import { ContentParticles } from './ContentParticles';

export class Content extends THREE.EventDispatcher {

	private renderer: THREE.WebGLRenderer;

	private commonUniforms: ORE.Uniforms;

	public root: THREE.Object3D;

	// animator

	private animator: ORE.Animator;

	// controls

	public controls: ContentControls;

	// info

	public info: ContentInfo;

	// content mesh

	public contentMeshList: ContentMesh[] = [];

	public ukonpower: UKONPOWER;
	public recollection: Recollection;
	public oregl: OreGL;

	private particles: ContentParticles;

	constructor( renderer: THREE.WebGLRenderer, contentRoot: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		super();

		this.renderer = renderer;

		this.root = contentRoot;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			envMap: {
				value: null
			}
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.contentChange = this.animator.add( {
			name: 'contentChange',
			initValue: 0,
			// easing: ORE.Easings.linear
		} );

		/*-------------------------------
			Controls
		-------------------------------*/

		this.controls = new ContentControls();

		this.controls.addListener( 'click', ( contentName: string ) => {

			this.select( contentName );

		} );

		/*-------------------------------
			Content Info
		-------------------------------*/

		this.info = new ContentInfo( this.root.getObjectByName( 'ContentInfo' )as THREE.Mesh, this.commonUniforms );

		this.info.addEventListener( 'close', () => {

			this.close();

		} );

		/*-------------------------------
			Mesh
		-------------------------------*/

		const onClickMesh = ( e: THREE.Event ) => {

			this.open( e.name );

		};

		// ukonpower

		this.ukonpower = new UKONPOWER( this.renderer, this.root.getObjectByName( 'UKONPOWER' ) as THREE.Mesh, this.commonUniforms );
		this.ukonpower.addEventListener( 'click', onClickMesh );
		this.root.add( this.ukonpower );

		this.contentMeshList.push( this.ukonpower );

		// recollection

		this.recollection = new Recollection( this.root.getObjectByName( 'Recollection' ) as THREE.Mesh, this.commonUniforms );
		this.recollection.addEventListener( 'click', onClickMesh );
		this.root.add( this.recollection );

		this.contentMeshList.push( this.recollection );

		// oregl

		this.oregl = new OreGL( this.commonUniforms );
		this.oregl.addEventListener( 'click', onClickMesh );
		this.root.add( this.oregl );

		this.contentMeshList.push( this.oregl );

		/*-------------------------------
			Particles
		-------------------------------*/

		this.particles = new ContentParticles( this.commonUniforms );
		this.particles.renderOrder = 999;
		this.root.add( this.particles );

		/*-------------------------------
			init
		-------------------------------*/

		// this.ukonpower.show();
		// this.recollection.show();
		// this.oregl.show();

		setTimeout( () => {

			this.select( 'ukonpower' );

		}, 0 );

	}

	public select( contentName: string ) {

		this.dispatchEvent( {
			type: 'select',
			contentName
		} );

		this.animator.setValue( 'contentChange', 0 );
		this.animator.animate( 'contentChange', 1, 2.0 );

		this.particles.rotation.y = ( Math.random() * Math.PI );

		this.contentMeshList.forEach( item => {

			if ( item.name == contentName ) {

				item.show();

				this.particles.setColorOffset( item.colorOffset );

			} else {

				item.hide();

			}

		} );

	}

	public open( contentName: string ) {

		this.dispatchEvent( {
			type: 'open',
			contentName
		} );

		this.info.open( contentName );

	}

	public close() {

		this.dispatchEvent( {
			type: 'close',
		} );

		this.info.close();

	}

	public resize( layerInfo: ORE.LayerInfo ) {

		this.info.resize( layerInfo );

		for ( let i = 0; i < this.contentMeshList.length; i ++ ) {

			this.contentMeshList[ i ].resize( layerInfo );

		}

	}

	public update( deltaTime: number, camera: THREE.PerspectiveCamera ) {

		this.info.update( deltaTime, camera );

		for ( let i = 0; i < this.contentMeshList.length; i ++ ) {

			let content = this.contentMeshList[ i ];
			content.update( deltaTime );

		}

	}

	public updateEnvMap( envMap: THREE.CubeTexture ) {

		this.commonUniforms.envMap.value = envMap;

	}

}
