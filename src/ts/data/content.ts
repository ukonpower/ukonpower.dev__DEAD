export type ContentData = {
	title: string,
	link: string | null,
	description: string,
	images: string[],
}

export const ContentDataList: ContentData[] = [
	{
		title: 'Recollection',
		link: 'https://recollection.ukon.dev/',
		images: [
			'./assets/scene/img/content/recollection/recollection_0.png',
			'./assets/scene/img/content/recollection/recollection_1.png',
			'./assets/scene/img/content/recollection/recollection_2.png',
			'./assets/scene/img/content/recollection/recollection_3.png',
		],
		description: `
			This is a graphical representation of the events I felt.
			High-cost rendering techniques such as ray marching are used.
		`
	}
];
