import * as THREE from 'three';
import * as ORE from 'ore-three';
import { ContentInfo } from './ContentInfo';
import { UKONPOWER } from './ContentMesh/UKONPOWER';
import { ContentMesh } from './ContentMesh';
import { Recollection } from './ContentMesh/Recollection';
import { ContentControls } from './ContentControls';
import { OreGL } from './ContentMesh/OreGL';

export class Content extends THREE.Object3D {

	private renderer: THREE.WebGLRenderer;

	private commonUniforms: ORE.Uniforms;

	public root: THREE.Object3D;

	// controls

	public controls: ContentControls;

	// info

	public info: ContentInfo;

	// content mesh

	public contentMeshList: ContentMesh[] = [];

	public ukonpower: UKONPOWER;
	public recollection: Recollection;
	public oregl: OreGL;

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

		this.contentMeshList.forEach( item => {

			if ( item.name == contentName ) {

				item.show();

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

			this.contentMeshList[ i ].update( deltaTime );

		}

	}

	public updateEnvMap( envMap: THREE.CubeTexture ) {

		this.commonUniforms.envMap.value = envMap;

	}

}
