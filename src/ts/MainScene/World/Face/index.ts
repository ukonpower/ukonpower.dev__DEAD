import * as THREE from 'three';
import * as ORE from 'ore-three';

import { PowerMesh } from 'power-mesh';

import faceVert from './shaders/face.vs';
import faceFrag from './shaders/face.fs';

export class Face extends PowerMesh {

	private animator: ORE.Animator;

	private actionOP: ORE.AnimationAction | null = null;

	constructor( mesh: THREE.Mesh, parentUniforms: ORE.Uniforms ) {

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			turingTex: {
				value: null
			},
			visibility: {
				value: 0
			},
			noiseTex: window.gManager.assetManager.getTex( 'noise' )
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		let animator = window.gManager.animator;

		uni.noise = animator.add( {
			name: 'faceNoise',
			initValue: 0
		} );

		animator.add( {
			name: 'faceOpFrame',
			initValue: 0,
			easing: ORE.Easings.linear
		} );

		super( mesh, {
			fragmentShader: faceFrag,
			vertexShader: faceVert,
			uniforms: uni
		}, true );

		this.animator = animator;

	}

	public update( deltaTime: number ) {

		if ( this.animator.isAnimatingVariable( 'faceOpFrame' ) ) {

			this.updateFrame( this.animator.get( 'faceOpFrame' ) || 0 );

		}

	}

	/*-------------------------------
		Animation
	-------------------------------*/

	public setAction( actionOP: ORE.AnimationAction ) {

		this.dispatchEvent( {
			type: 'setAction'
		} );

		const onUpdateFaceMaterialAction = ( action: ORE.AnimationAction ) => {

			this.commonUniforms.visibility.value = action.getValue( 'FaceVisibility' ) || 0;

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
		Turing
	-------------------------------*/

	public set turing( value: THREE.Texture ) {

		this.commonUniforms.turingTex.value = value;

	}

	public noise( duration: number = 5 ) {

		this.animator.animate( 'faceNoise', Math.random(), duration );

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
