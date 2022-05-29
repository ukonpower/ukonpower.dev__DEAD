import * as THREE from 'three';
import * as ORE from 'ore-three';

export class ContentMesh extends THREE.Object3D {

	protected commonUniforms: ORE.Uniforms;
	protected animator: ORE.Animator;

	protected viewing: boolean = false;

	public colorOffset: number = 0.0;

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

		this.animator.add( {
			name: 'rotation' + this.uuid,
			initValue: - 1
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

		this.animator.setValue( 'rotation' + this.uuid, - 1 );
		this.animator.animate( 'rotation' + this.uuid, 0, duration );


	}

	public hide() {

		this.viewing = false;

		let duration = 2.0;

		window.gManager.eRay.removeTouchableObject( this );

		this.animator.animate( 'visibility' + this.uuid, 0, duration, () => {

			this.visible = false;

		} );

		this.animator.animate( 'rotation' + this.uuid, 1, duration );

	}

	public update( deltaTime: number ) {

		if ( this.animator.isAnimatingVariable( 'rotation' + this.uuid ) ) {

			this.rotation.y = ( this.animator.get<number>( 'rotation' + this.uuid ) || 0 ) * Math.PI;

		}

	}

	public resize( layerInfo: ORE.LayerInfo ) {
	}

}
