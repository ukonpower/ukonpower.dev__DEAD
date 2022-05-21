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
			record the sensations and emotions I felt at that time.
		`
	}
];
