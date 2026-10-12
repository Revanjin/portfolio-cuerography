import { settings } from '#lib/settings.ts';

export const prerender = true;

// Impressum und Datenschutz stehen auf noindex und fehlen deshalb hier.
const paths = ['', '/contact'];

export function GET() {
	const urls = paths.map((path) => `\t<url><loc>${settings.siteUrl}${path}</loc></url>`).join('\n');

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
		{ headers: { 'Content-Type': 'application/xml' } }
	);
}
