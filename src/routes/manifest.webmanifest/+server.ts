import { settings } from '#lib/settings.ts';

export const prerender = true;

export function GET() {
	const manifest = {
		name: settings.name,
		short_name: settings.name,
		start_url: '/',
		display: 'standalone',
		background_color: '#FAFAF8',
		theme_color: '#FAFAF8',
		icons: [
			{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
			{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
			{ src: '/icons/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
		]
	};

	return new Response(JSON.stringify(manifest), {
		headers: { 'Content-Type': 'application/manifest+json' }
	});
}
