import type { Photo } from './photos';

const UNSPLASH = 'https://images.unsplash.com';

interface Source {
	id: string;
	width: number;
	height: number;
}

function imageUrl({ id, width, height }: Source, w: number, quality: number) {
	const h = Math.round((w * height) / width);
	return `${UNSPLASH}/${id}?w=${w}&h=${h}&q=${quality}&auto=format&fit=crop`;
}

function srcset(source: Source, widths: number[], quality: number) {
	return widths.map((w) => `${imageUrl(source, w, quality)} ${w}w`).join(', ');
}

export const previewSrc = (photo: Photo) => imageUrl(photo, 480, 65);
export const previewSrcset = (photo: Photo) => srcset(photo, [480, 960], 65);

// 1600 px an der langen Kante, damit Hochformate nicht 2400 px hoch werden
export function largeSrc(photo: Photo) {
	const w = photo.width >= photo.height ? 1600 : Math.round((1600 * photo.width) / photo.height);
	return imageUrl(photo, w, 75);
}

// Die Poster sind das erste Bild des Videos und liegen deshalb lokal neben den Videodateien:
// nur so blendet das Video ohne Sprung ein.
export const poster = {
	wide: { width: 1600, height: 900, dominantColor: '#151112' },
	tall: { width: 720, height: 900, dominantColor: '#1a1515' }
};

const posterSrcset = (cut: 'wide' | 'tall', widths: number[]) =>
	widths.map((w) => `/poster/${cut}-${w}.webp ${w}w`).join(', ');

export const posterWideSrc = '/poster/wide-960.webp';
export const posterWideSrcset = posterSrcset('wide', [640, 960, 1600]);
export const posterTallSrcset = posterSrcset('tall', [480, 720]);
