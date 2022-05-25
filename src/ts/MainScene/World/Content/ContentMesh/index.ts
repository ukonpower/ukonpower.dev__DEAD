import * as THREE from 'three';
import * as ORE from 'ore-three';

export class ContentMesh extends THREE.Object3D {

	protected commonUniforms: ORE.Uniforms;
	protected animator: ORE.Animator;

	protected viewing: boolean = false;

	constructor( name: string, parentUniforms: ORE.Uniforms ) {

		super();

		this.name = name;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.visibility = this.animator.add( {
			name: 'visibility' + this.uuid,
			initValue: 0
		} );

		/*-------------------------------
			Click
		-------------------------------*/

		window.gManager.eRay.addEventListener( 'click/' + this.name, ( obj )=> {

			this.dispatchEvent( {
				type: 'click',
				name: this.name
			} );

		} );

		this.visible = false;

	}

	public show() {

		this.viewing = true;

		this.visible = true;

		let duration = 2.0;

		window.gManager.eRay.addTouchableObject( this );

		this.animator.animate( 'visibility' + this.uuid, 1, duration );

	}

	public hide() {

		this.viewing = false;

		let duration = 2.0;

		window.gManager.eRay.removeTouchableObject( this );

		this.animator.animate( 'visibility' + this.uuid, 0, duration, () => {

			this.visible = false;

		} );

	}

	public update( deltaTime: number ) {
	}

	public resize( layerInfo: ORE.LayerInfo ) {
	}

}
