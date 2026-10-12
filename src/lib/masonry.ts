import type { Photo } from './photos';

export interface MasonryItem {
	photo: Photo;
	index: number;
}

interface Layout {
	from: number;
	until?: number;
	columns: MasonryItem[][];
}

interface Breakpoint {
	from: number;
	count: number;
	columnWidth: number;
	rowGap: number;
	captionHeight: number;
}

// Jedes Foto kommt in die gerade kürzeste Spalte. Gerechnet wird in Spaltenbreiten;
// Beschriftung und Zeilenabstand zählen mit, sonst kippt die Reihenfolge bei vielen Hochformaten.
function distribute(photos: Photo[], { count, columnWidth, rowGap, captionHeight }: Breakpoint) {
	const extra = (captionHeight + rowGap) / columnWidth;
	const heights = Array.from({ length: count }, () => 0);
	const columns: MasonryItem[][] = heights.map(() => []);

	photos.forEach((photo, index) => {
		let shortest = 0;
		for (let column = 1; column < count; column++) {
			if (heights[column] < heights[shortest] - 0.001) shortest = column;
		}
		columns[shortest].push({ photo, index });
		heights[shortest] += photo.height / photo.width + extra;
	});

	return columns;
}

const signature = (columns: MasonryItem[][]) =>
	columns.map((column) => column.map((item) => item.index).join(',')).join('|');

// Die Verteilung hängt von der Spaltenbreite ab und steht deshalb je Breakpoint fertig im HTML.
// Gleiche Nachbarn werden zusammengelegt, damit nichts doppelt ausgeliefert wird.
export function masonryLayouts(photos: Photo[], columnsDesktop: 2 | 3, captions: boolean) {
	const breakpoints: Breakpoint[] = [
		{ from: 0, count: 2, columnWidth: 158, rowGap: 20, captionHeight: captions ? 23 : 0 },
		{ from: 720, count: 2, columnWidth: 350, rowGap: 28, captionHeight: captions ? 27 : 0 },
		{
			from: 1024,
			count: columnsDesktop,
			columnWidth: columnsDesktop === 3 ? 286 : 441,
			rowGap: 32,
			captionHeight: captions ? 27 : 0
		}
	];

	const layouts: Layout[] = [];
	for (const breakpoint of breakpoints) {
		const columns = distribute(photos, breakpoint);
		const previous = layouts.at(-1);
		if (previous && signature(previous.columns) === signature(columns)) continue;
		if (previous) previous.until = breakpoint.from;
		layouts.push({ from: breakpoint.from, columns });
	}

	return layouts;
}
