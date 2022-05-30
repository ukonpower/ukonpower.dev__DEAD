import EventEmitter from 'wolfy87-eventemitter';

export class ContentControls extends EventEmitter {

	private rootElm: HTMLElement;
	private contentItemList: HTMLElement[] = [];

	constructor( ) {

		super();

		this.rootElm = document.querySelector( '.footer-controls' ) as HTMLElement;

		// init items

		this.contentItemList = Array.from( this.rootElm.querySelectorAll<HTMLElement>( '.footer-controls-buttonList-item' ) );

		this.contentItemList.forEach( item => {

			let btn = item.querySelector( '.footer-controls-button' ) as HTMLButtonElement;

			btn.addEventListener( 'click', this.onClickContent.bind( this ) );

		} );

	}

	private onClickContent( e: Event ) {

		let target = e.target as HTMLButtonElement;

		let contentName = target.getAttribute( 'data-content' ) || '';

		this.emitEvent( 'click', [ contentName ] );

	}

}
