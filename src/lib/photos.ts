export interface Photo {
	id: string;
	title: string;
	year: string;
	width: number;
	height: number;
	dominantColor: string;
}

// width/height sind die Pixelmaße des Ausschnitts, den Unsplash höchstens liefert.
// 03 und 08 sind auf 1:1 bzw. 16:9 beschnitten, alle anderen unbeschnitten.
export const photos: Photo[] = [
	{
		id: 'photo-1506744038136-46273834b3fb',
		title: '[Title of the work]',
		year: '[Year]',
		width: 7360,
		height: 4912,
		dominantColor: '#8a989e'
	},
	{
		id: 'photo-1534528741775-53994a69daeb',
		title: '[Title]',
		year: '[Year]',
		width: 3276,
		height: 4096,
		dominantColor: '#6e70a2'
	},
	{
		id: 'photo-1486406146926-c627a92ad1ab',
		title: '[Title of a series, part 1]',
		year: '[Year]',
		width: 4000,
		height: 4000,
		dominantColor: '#797d85'
	},
	{
		id: 'photo-1500530855697-b586d89ba3ee',
		title: '[Title]',
		year: '[Year]',
		width: 3648,
		height: 5472,
		dominantColor: '#756868'
	},
	{
		id: 'photo-1531746020798-e6953c6e8e04',
		title: '[Title of the work]',
		year: '[Year]',
		width: 2550,
		height: 3188,
		dominantColor: '#a07b6c'
	},
	{
		id: 'photo-1493246507139-91e8fad9978e',
		title: '[Title]',
		year: '[Year]',
		width: 5472,
		height: 3648,
		dominantColor: '#6b6060'
	},
	{
		id: 'photo-1524504388940-b1c1722653e1',
		title: '[Title of a series, part 2]',
		year: '[Year]',
		width: 3456,
		height: 5184,
		dominantColor: '#383232'
	},
	{
		id: 'photo-1470071459604-3b5ec3a7fe05',
		title: '[A longer title of a work]',
		year: '[Year]',
		width: 7372,
		height: 4147,
		dominantColor: '#6f7268'
	},
	{
		id: 'photo-1516035069371-29a1b244cc32',
		title: '[Title]',
		year: '[Year]',
		width: 1638,
		height: 2048,
		dominantColor: '#2c2d2c'
	},
	{
		id: 'photo-1519681393784-d120267933ba',
		title: '[Title of the work]',
		year: '[Year]',
		width: 4096,
		height: 2733,
		dominantColor: '#3e4b69'
	}
];

export function photoNumber(index: number) {
	return String(index + 1).padStart(2, '0');
}
