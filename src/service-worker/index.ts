import { version } from '$app/env';
import { assets, immutable, prerendered } from '$app/manifest';
import { self } from '$app/service-worker';
import { settings } from '#lib/settings.ts';

const SHELL = `shell-${version}`;
const MEDIA = 'media';
const UNSPLASH = 'https://images.unsplash.com';
const PHONE_VIDEO = '/video/loop-4x5.mp4';

// $app/manifest liefert Pfade relativ zur Basis, die Startseite als leeren String
const paths = [...immutable, ...assets, ...prerendered].map((entry) => `/${entry.path}`);
const shell = paths.filter((path) => !path.startsWith('/video/'));
const storesVideo = settings.video.offline && paths.includes(PHONE_VIDEO);

// Seiten, die mangels Netz aus dem Cache kamen; die Seite fragt das nach dem Laden ab
const servedFromCache = new Set<string>();

// Viele Server schicken Vary: Origin. Skripte und Schriften fragen mit Origin an, der Vorrat
// wurde ohne geladen: ohne ignoreVary fände der Cache seine eigenen Dateien nicht.
const anyVariant = { ignoreSearch: true, ignoreVary: true };

self.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			await (await caches.open(SHELL)).addAll(shell);
			if (storesVideo) await (await caches.open(MEDIA)).add(PHONE_VIDEO);
		})()
	);
});

// Kein skipWaiting: eine neue Version wartet, bis alle Tabs zu sind, und gilt ab dem nächsten Öffnen.
self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) {
				if (key.startsWith('shell-') && key !== SHELL) await caches.delete(key);
			}
			await self.clients.claim();
		})()
	);
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;

	const url = new URL(request.url);

	if (url.origin === UNSPLASH) {
		event.respondWith(image(event, url));
	} else if (url.origin !== self.location.origin) {
		return;
	} else if (request.mode === 'navigate') {
		event.respondWith(page(event));
	} else if (storesVideo && url.pathname === PHONE_VIDEO) {
		event.respondWith(video(request));
	} else if (shell.includes(url.pathname)) {
		event.respondWith(fromShell(request));
	}
});

self.addEventListener('message', (event) => {
	const { data, source } = event;

	if (data?.type === 'store') {
		event.waitUntil(store(data.urls));
	} else if (data?.type === 'served?' && source instanceof Client && servedFromCache.has(source.id)) {
		source.postMessage({ type: 'served', fromCache: true });
	}
});

async function page(event: FetchEvent) {
	try {
		const response = await fetch(event.request);
		servedFromCache.delete(event.resultingClientId);
		return response;
	} catch {
		servedFromCache.add(event.resultingClientId);
		const cache = await caches.open(SHELL);
		const cached = await cache.match(event.request, anyVariant);
		return cached ?? (await cache.match('/', anyVariant)) ?? Response.error();
	}
}

async function fromShell(request: Request) {
	const cached = await (await caches.open(SHELL)).match(request, anyVariant);
	return cached ?? fetch(request);
}

async function image(event: FetchEvent, url: URL) {
	const cache = await caches.open(MEDIA);
	const cached = await cache.match(event.request, { ignoreVary: true });
	if (cached) return cached;

	try {
		const response = await fetch(event.request);
		// opake Antworten belegen im Cache pauschal mehrere MB, deshalb nur lesbare speichern
		if (response.ok && response.type === 'cors') {
			event.waitUntil(cache.put(event.request, response.clone()));
		}
		return response;
	} catch {
		return (await otherSize(cache, url)) ?? Response.error();
	}
}

// Offline lieber dasselbe Foto in einer anderen Größe als gar keins
async function otherSize(cache: Cache, url: URL) {
	const keys = await cache.keys();
	const sibling = keys.find((key) => new URL(key.url).pathname === url.pathname);
	return sibling && cache.match(sibling, { ignoreVary: true });
}

async function store(urls: string[]) {
	const cache = await caches.open(MEDIA);

	for (const url of urls) {
		if (!url.startsWith(UNSPLASH) || (await cache.match(url, { ignoreVary: true }))) continue;
		try {
			const response = await fetch(url, { mode: 'cors', headers: { Accept: 'image/avif,image/webp,*/*' } });
			if (response.ok) await cache.put(url, response);
		} catch {
			// kein Netz mehr: beim nächsten Besuch wieder
		}
	}
}

// Safari spielt Videos nur, wenn Range-Requests mit 206 und Content-Range beantwortet werden
async function video(request: Request) {
	const cached = await (await caches.open(MEDIA)).match(PHONE_VIDEO);
	if (!cached) return fetch(request);

	const range = /bytes=(\d+)-(\d*)/.exec(request.headers.get('range') ?? '');
	if (!range) return cached;

	const file = await cached.blob();
	const start = Number(range[1]);
	const end = range[2] ? Math.min(Number(range[2]), file.size - 1) : file.size - 1;

	return new Response(file.slice(start, end + 1), {
		status: 206,
		headers: {
			'Content-Type': 'video/mp4',
			'Content-Range': `bytes ${start}-${end}/${file.size}`,
			'Content-Length': String(end - start + 1),
			'Accept-Ranges': 'bytes'
		}
	});
}
