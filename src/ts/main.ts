import * as ORE from 'ore-three';
import { MainScene } from './MainScene';

import { GlobalManager } from './MainScene/GlobalManager';
import { AssetManager } from './MainScene/GlobalManager/AssetManager';

declare global {
	interface Window {
		gManager: GlobalManager;
		assetManager: AssetManager;
		isIE: boolean;
		isSP: boolean;
		mainScene: MainScene;
	}
}


class APP {

	private canvas: HTMLCanvasElement | null;
	private controller: ORE.Controller;
	private scene: MainScene;

	constructor() {

		/*------------------------
			checkUA
		------------------------*/
		var ua = navigator.userAgent;
		window.isSP = ( ua.indexOf( 'iPhone' ) > 0 || ua.indexOf( 'iPod' ) > 0 || ua.indexOf( 'Android' ) > 0 && ua.indexOf( 'Mobile' ) > 0 || ua.indexOf( 'iPad' ) > 0 || ua.indexOf( 'Android' ) > 0 || ua.indexOf( 'macintosh' ) > 0 );
		window.isSP = window.isSP || navigator.platform == "iPad" || ( navigator.platform == "MacIntel" && navigator.userAgent.indexOf( "Safari" ) != - 1 && navigator.userAgent.indexOf( "Chrome" ) == - 1 && ( navigator as any ).standalone !== undefined );

		/*------------------------
			Scene
		------------------------*/

		this.scene = new MainScene();

		/*-------------------------------
			Controller
		-------------------------------*/

		this.canvas = document.querySelector( "#canvas" );

		this.controller = new ORE.Controller();
		this.controller.addLayer( this.scene, {
			name: 'Main',
			canvas: this.canvas || undefined,
			wrapperElement: document.querySelector( '.canvas-inner' ) as HTMLElement,
			pixelRatio: Math.max( 1.0, window.devicePixelRatio * 0.5 ),
		} );

	}

}

window.addEventListener( 'load', ()=>{

	let app = new APP();

} );
