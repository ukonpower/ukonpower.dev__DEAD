import * as THREE from 'three';
import * as ORE from 'ore-three';
import { TuringPatternRenderer } from "./TuringPatternRenderer";

export class TuringPattern {

	private commonUniforms: ORE.Uniforms;

	private renderer: THREE.WebGLRenderer;
	private animator: ORE.Animator;
	public turingPatternRenderer: TuringPatternRenderer;

	private turingPatternPreset: {feed: number, kill: number}[] = [
		{ feed: 0.0258, kill: 0.0517 },
		{ feed: 0.0421, kill: 0.0604 },
		{ feed: 0.0261, kill: 0.0604 },
		{ feed: 0.02, kill: 0.0504 },
	];

	constructor( renderer: THREE.WebGLRenderer, parentUniforms: ORE.Uniforms ) {

		this.renderer = renderer;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {

		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		/*-------------------------------
			Renderer
		-------------------------------*/

		this.turingPatternRenderer = new TuringPatternRenderer( this.renderer, this.commonUniforms );



		this.animator.add( {
			name: 'turingSetting',
			initValue: new THREE.Vector2( this.turingPatternPreset[ 0 ].feed, this.turingPatternPreset[ 0 ].kill )
		} );

	}

	public noise( duration: number = 5 ) {

		let setting = this.turingPatternPreset[ Math.floor( Math.random() * this.turingPatternPreset.length ) ];

		this.animator.animate( 'turingSetting', new THREE.Vector2( setting.feed, setting.kill ), 5 );
		this.turingPatternRenderer.noise( duration );

	}

	public update( deltaTime: number ) {

		if ( this.animator.isAnimatingVariable( 'turingSetting' ) ) {

			let turingSetting = this.animator.get( 'turingSetting' ) as THREE.Vector2;

			this.turingPatternRenderer.feed = turingSetting.x;
			this.turingPatternRenderer.kill = turingSetting.y;

		}

		this.turingPatternRenderer.update( deltaTime );

	}

}
