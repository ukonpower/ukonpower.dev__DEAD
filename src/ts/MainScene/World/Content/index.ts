import * as THREE from 'three';
import * as ORE from 'ore-three';
import { ContentInfo } from './ContentInfo';
import { UKONPOWER } from '../ContentMesh/UKONPOWER';

export class Content extends THREE.Object3D {

	private renderer: THREE.WebGLRenderer;

	private commonUniforms: ORE.Uniforms;

	public root: THREE.Object3D;

	// info

	public info: ContentInfo;

	// content mesh

	public ukonpower: UKONPOWER;

	constructor( renderer: THREE.WebGLRenderer, contentRoot: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		super();

		this.renderer = renderer;

		this.root = contentRoot;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {

		} );


		/*-------------------------------
			Content
		-------------------------------*/

		this.info = new ContentInfo( this.root.getObjectByName( 'ContentInfo' )as THREE.Mesh, this.commonUniforms );

		this.info.addEventListener( 'close', () => {

			this.dispatchEvent( {
				type: 'close'
			} );

		} );

		this.add( this.info );

		/*-------------------------------
			Face
		-------------------------------*/

		this.ukonpower = new UKONPOWER( this.renderer, this.root.getObjectByName( 'UKONPOWER' ) as THREE.Mesh, this.commonUniforms );
		this.ukonpower.addEventListener( 'click', this.dispatchClick.bind( this ) );
		this.root.add( this.ukonpower );

	}

	public open( contentName: string ) {

		this.info.open( contentName );

	}

	public close() {

		this.info.close();

	}

	public resize( layerInfo: ORE.LayerInfo ) {

		this.info.resize( layerInfo );

	}

	public update( deltaTime: number, camera: THREE.PerspectiveCamera ) {

		this.info.update( deltaTime, camera );

		this.ukonpower.update( deltaTime );

	}

	private dispatchClick( e: THREE.Event ) {

		this.dispatchEvent( {
			type: 'click',
			contentName: e.name,
		} );

	}

}
