export type ContentImgData = {
	url: string,
	link?: string
}

export type ContentData = {
	title: string,
	titleDisplay: string,
	link: string,
	linkDisplay: string,
	description: string,
	images: ContentImgData[],
}

export const ContentDataList: ContentData[] = [
	{
		title: 'ukonpower',
		titleDisplay: 'UKONPOWER',
		link: 'https://ukon.dev/',
		linkDisplay: 'ukon.dev',
		images: [
			{
				url: './assets/scene/img/content/recollection/recollection_0.png',
				link: 'https://recollection.ukon.dev/'
			},
		],
		description: `
			I AM UKONPOWER
		`
	},
	{
		title: 'recollection',
		titleDisplay: 'Recollection',
		link: 'https://recollection.ukon.dev/',
		linkDisplay: 'recollection.ukon.dev',
		images: [
			{
				url: './assets/scene/img/content/recollection/recollection_0.png',
				link: 'https://recollection.ukon.dev/'
			},
			{
				url: './assets/scene/img/content/recollection/recollection_1.png',
				link: 'https://recollection.ukon.dev/focused'
			},
			{
				url: './assets/scene/img/content/recollection/recollection_2.png',
				link: 'https://recollection.ukon.dev/elapsed'
			},
			{
				url: './assets/scene/img/content/recollection/recollection_3.png',
				link: 'https://recollection.ukon.dev/'
			}
		],
		description: `
			This is a graphical representation of the events I felt.
			High-cost rendering techniques such as ray marching are used.
		`
	},
	{
		title: 'oregl',
		titleDisplay: 'OreGL',
		link: 'https://oregl.ukon.dev/',
		linkDisplay: 'oregl.ukon.dev',
		images: [
			{
				url: './assets/scene/img/content/recollection/recollection_0.png',
				link: 'https://recollection.ukon.dev/'
			},
			{
				url: './assets/scene/img/content/recollection/recollection_1.png',
				link: 'https://recollection.ukon.dev/focused'
			},
			{
				url: './assets/scene/img/content/recollection/recollection_2.png',
				link: 'https://recollection.ukon.dev/elapsed'
			},
			{
				url: './assets/scene/img/content/recollection/recollection_3.png',
				link: 'https://recollection.ukon.dev/'
			}
		],
		description: `
			ORE NO WebGL
		`
	}
];
