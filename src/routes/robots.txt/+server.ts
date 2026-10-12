import { settings } from '#lib/settings.ts';

export const prerender = true;

export function GET() {
	return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${settings.siteUrl}/sitemap.xml\n`, {
		headers: { 'Content-Type': 'text/plain' }
	});
}
