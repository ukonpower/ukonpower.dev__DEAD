import * as THREE from 'three';
import * as ORE from 'ore-three';
import { ContentMesh } from '..';
import { Face } from './Face';
import { TuringPattern } from './TuringPattern';

export class UKONPOWER extends ContentMesh {

	private renderer: THREE.WebGLRenderer;

	private actionOP: ORE.AnimationAction | null = null;

	public face: Face;

	// turing

	private turingPattern: TuringPattern;

	constructor( renderer: THREE.WebGLRenderer, faceMesh: THREE.Mesh, parentUniforms: ORE.Uniforms ) {

		super( 'ukonpower', parentUniforms );

		this.renderer = renderer;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
			openingVisibility: {
				value: 0
			}
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.animator.add( {
			name: 'faceOpFrame',
			initValue: 0,
			easing: ORE.Easings.linear
		} );

		/*-------------------------------
			TuringPattern
		-------------------------------*/

		this.turingPattern = new TuringPattern( this.renderer, this.commonUniforms );

		this.commonUniforms.turingSize = {
			value: this.turingPattern.turingPatternRenderer.size
		};

		window.setInterval( () => {

			this.turingPattern.noise( 5 );

		}, 5000 );

		/*-------------------------------
			Face
		-------------------------------*/

		this.position.copy( faceMesh.position );
		this.rotation.copy( faceMesh.rotation );
		this.scale.copy( faceMesh.scale );

		this.face = new Face( faceMesh, this.commonUniforms );
		this.face.position.set( 0, 0, 0 );
		this.face.rotation.set( 0, 0, 0 );
		this.face.scale.set( 1.0, 1.0, 1.0 );
		this.add( this.face );

	}

	/*-------------------------------
		Animation
	-------------------------------*/

	public setAction( actionOP: ORE.AnimationAction ) {

		this.dispatchEvent( {
			type: 'setAction'
		} );

		const onUpdateFaceMaterialAction = ( action: ORE.AnimationAction ) => {

			this.commonUniforms.openingVisibility.value = action.getValue( 'FaceVisibility' ) || 0;

		};

		actionOP.addListener( 'update', onUpdateFaceMaterialAction );

		const onSetNextAction = () => {

			this.actionOP?.removeListener( 'update', onUpdateFaceMaterialAction );

			this.removeEventListener( 'setAction', onSetNextAction );

		};

		this.addEventListener( 'setAction', onSetNextAction );

		this.actionOP = actionOP;

	}

	public updateFrame( frame: number ) {

		if ( this.actionOP ) {

			this.actionOP.updateFrame( frame );

		}

	}

	/*-------------------------------
		Update
	-------------------------------*/

	public update( deltaTime: number ) {

		super.update( deltaTime );

		if ( this.animator.isAnimatingVariable( 'faceOpFrame' ) ) {

			this.updateFrame( this.animator.get( 'faceOpFrame' ) || 0 );

		}

		/*-------------------------------
			TuringPattern
		-------------------------------*/

		this.turingPattern.update( deltaTime );

		this.face.turing = this.turingPattern.turingPatternRenderer.texture;

	}

	/*-------------------------------
		Animation
	-------------------------------*/

	public play( type: string, skip?: boolean ) {

		if ( type == 'op' ) {

			if ( this.actionOP ) {

				let start = this.actionOP.frame.start;
				let end = this.actionOP.frame.end;

				if ( skip ) {

					this.updateFrame( end );

				} else {

					this.animator.setValue( 'faceOpFrame', start );
					this.animator.animate( 'faceOpFrame', end, this.actionOP.frame.duration / 30.0 );

				}

			}

		}

	}

}
