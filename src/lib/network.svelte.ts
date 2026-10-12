const LAST_ONLINE = 'last-online';

export const network = $state({
	isOffline: false,
	lastOnline: null as Date | null
});

function readLastOnline() {
	try {
		const stored = localStorage.getItem(LAST_ONLINE);
		return stored ? new Date(Number(stored)) : null;
	} catch {
		return null;
	}
}

function setOffline(isOffline: boolean) {
	network.isOffline = isOffline;
	if (isOffline) {
		network.lastOnline = readLastOnline();
		return;
	}
	try {
		localStorage.setItem(LAST_ONLINE, String(Date.now()));
	} catch {
		// privater Modus: dann fehlt offline nur das Datum
	}
}

export function watchNetwork() {
	const onOnline = () => setOffline(false);
	const onOffline = () => setOffline(true);
	// navigator.onLine bleibt bei totem Mobilfunk oft true; der Service Worker weiß,
	// ob er diese Seite aus dem Cache liefern musste
	const onMessage = (event: MessageEvent) => {
		if (event.data?.type === 'served') setOffline(event.data.fromCache);
	};

	setOffline(!navigator.onLine);
	window.addEventListener('online', onOnline);
	window.addEventListener('offline', onOffline);
	navigator.serviceWorker?.addEventListener('message', onMessage);
	navigator.serviceWorker?.controller?.postMessage({ type: 'served?' });

	return () => {
		window.removeEventListener('online', onOnline);
		window.removeEventListener('offline', onOffline);
		navigator.serviceWorker?.removeEventListener('message', onMessage);
	};
}

// Was schon geladen ist, kennt der Service Worker beim ersten Besuch nicht, weil er da noch
// nicht zuständig war. Die Seite meldet es nach und lässt den Rest im Hintergrund laden.
export async function storeForOffline() {
	if (!('serviceWorker' in navigator) || navigator.connection?.saveData) return;

	const registration = await navigator.serviceWorker.ready;
	const images = [...document.querySelectorAll<HTMLImageElement>('img[data-offline]')].filter(
		(image) => image.getClientRects().length > 0
	);

	const loaded = images.filter((image) => image.complete && image.currentSrc);
	registration.active?.postMessage({ type: 'store', urls: loaded.map((image) => image.currentSrc) });

	for (const image of images) {
		if (!image.complete) image.loading = 'eager';
	}
}
