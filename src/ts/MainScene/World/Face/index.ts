import * as THREE from 'three';
import * as ORE from 'ore-three';

import { PowerMesh } from 'power-mesh';

import faceVert from './shaders/face.vs';
import faceFrag from './shaders/face.fs';

export class Face extends PowerMesh {

	private animator: ORE.Animator;

	private faceMaterialAction: ORE.AnimationAction | null = null;

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

		let animator = window.gManager.animator;

		uni.noise = animator.add( {
			name: 'faceNoise',
			initValue: 0
		} );

		super( mesh, {
			fragmentShader: faceFrag,
			vertexShader: faceVert,
			uniforms: uni
		}, true );

		this.animator = animator;

	}

	/*-------------------------------
		Animation
	-------------------------------*/

	public setAction( faceMaterialAction: ORE.AnimationAction ) {

		this.dispatchEvent( {
			type: 'setAction'
		} );

		const onUpdateFaceMaterialAction = ( action: ORE.AnimationAction ) => {

			this.commonUniforms.visibility.value = action.getValue( 'FaceVisibility' ) || 0;

		};

		faceMaterialAction.addListener( 'update', onUpdateFaceMaterialAction );

		const onSetNextAction = () => {

			this.faceMaterialAction?.removeListener( 'update', onUpdateFaceMaterialAction );

			this.removeEventListener( 'setAction', onSetNextAction );

		};

		this.addEventListener( 'setAction', onSetNextAction );

		this.faceMaterialAction = faceMaterialAction;

	}

	public updateFrame( frame: number ) {

		if ( this.faceMaterialAction ) {

			this.faceMaterialAction.updateFrame( frame );

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

}
