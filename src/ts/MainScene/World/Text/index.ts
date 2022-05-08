import * as THREE from 'three';
import * as ORE from 'ore-three-ts';
import EventEmitter from 'wolfy87-eventemitter';
import { CurveTextMesh } from './CurveTextMesh';

type TextMeshData = {
	offset: number,
	mesh: CurveTextMesh,
}

export class CurveText extends EventEmitter {

	public line: THREE.Mesh<THREE.BufferGeometry, THREE.LineBasicMaterial>;

	private commonUniforms: ORE.Uniforms;
	private linePosArray: THREE.Vector3[];

	private meshDataList: TextMeshData[];
	private totalTextMeshWidth: number;

	constructor( line: THREE.Mesh<THREE.BufferGeometry, THREE.LineBasicMaterial>, parentUniforms?: ORE.Uniforms ) {

		super();

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		this.line = line;
		this.line.material.visible = false;

		this.meshDataList = [];
		this.totalTextMeshWidth = 0;

		let meshInfo = this.line.name.split( '-' );
		let text = meshInfo[ 1 ];

		this.create( text );

		/*-------------------------------
			Parse Position Array
		-------------------------------*/

		this.linePosArray = [];

		let posAttr = this.line.geometry.getAttribute( 'position' );
		let posArray = posAttr.array;

		for ( let i = 0; i < posArray.length; i += 3 ) {

			let p = new THREE.Vector3(
				posArray[ i ],
				posArray[ i + 1 ],
				posArray[ i + 2 ]
			);

			this.linePosArray.push( p );

		}

	}

	private async create( text: string ) {

		/*-------------------------------
			Create MSDF Mesh
		-------------------------------*/

		let [ fontData, texture ] = await this.load( 'font' );
		let offset = 0;

		text.split( '' ).forEach( ( char ) => {

			if ( char != '_' ) {

				let textMesh = new CurveTextMesh( char, fontData, texture, 0.85, this.commonUniforms );
				this.line.add( textMesh );

				let size = textMesh.size.x;

				if ( char == "N" ) {

					size *= 0.72;

				}

				if ( char == "I" ) {

					size *= 1.2;

				}

				offset += size / 2;

				this.meshDataList.push( {
					offset: offset,
					mesh: textMesh
				} );

				offset += size / 2;

			} else {

				offset += 0.08;

			}

		} );

		this.totalTextMeshWidth = offset;

	}

	public update( deltaTime: number, sectionTime: number ) {

		if ( - 1.0 <= sectionTime && sectionTime <= 1.0 ) {

			this.meshDataList.forEach( ( textData, index ) => {

				let maxIndex = this.linePosArray.length - 1.0;

				let t = 0.5 + ( ( textData.offset / this.totalTextMeshWidth ) - 0.5 ) * 0.5 + ( - sectionTime );
				let i = Math.max( 0.0, Math.min( maxIndex, t * ( this.linePosArray.length - 1.0 ) ) );

				let i2 = Math.floor( i );
				let i1 = Math.max( 0.0, Math.min( maxIndex, i2 - 1 ) );
				let i3 = Math.max( 0.0, Math.min( maxIndex, i2 + 1 ) );
				let i4 = Math.max( 0.0, Math.min( maxIndex, i2 + 2 ) );

				let blend = i - i2;

				let p1 = this.linePosArray[ i1 ];
				let p2 = this.linePosArray[ i2 ];
				let p3 = this.linePosArray[ i3 ];
				let p4 = this.linePosArray[ i4 ];

				let pos = p2.clone().lerp( p3, blend );
				textData.mesh.position.copy( pos );

				let d1 = p1.clone().sub( p2 );
				let d2 = p2.clone().sub( p3 );
				let d3 = p3.clone().sub( p4 );

				let dh1 = d1.lerp( d2, 0.5 );
				let dh2 = d2.lerp( d3, 0.5 );

				textData.mesh.quaternion.copy( new THREE.Quaternion().setFromUnitVectors( new THREE.Vector3( - 1.0, 0.0, 0.0 ), dh1.clone().lerp( dh2, blend ).normalize() ) );
				textData.mesh.curveTime = t;

			} );

		}


	}

	private async load( fontName: string ) {

		let xhr = new XMLHttpRequest();
		xhr.open( 'GET', './assets/fonts/' + fontName + '.json' );

		let prmFontData = new Promise<any>( resolve => {

			xhr.onload = () => {

				let response = JSON.parse( xhr.response );

				resolve( response );

			};

			xhr.send();

		} );


		let loader = new THREE.TextureLoader();
		let prmTexture = new Promise<THREE.Texture>( ( resolve ) => {

			loader.load( './assets/fonts/' + fontName + '.png', tex => {

				resolve( tex );

			} );

		} );

		return Promise.all( [ prmFontData, prmTexture ] );

	}

}
