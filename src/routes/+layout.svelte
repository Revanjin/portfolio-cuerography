<script lang="ts">
	import '#lib/styles/base.scss';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import OfflineBar from '#lib/components/OfflineBar.svelte';
	import { storeForOffline, watchNetwork } from '#lib/network.svelte.ts';

	let { children } = $props();

	// Seitenwechsel als View Transition; die Bewegung selbst steht in base.scss.
	// Browser ohne die API wechseln wie bisher ohne Übergang.
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	onMount(() => {
		const stopWatching = watchNetwork();
		// erst wenn die Seite steht: das Speichern soll dem Poster keine Bandbreite nehmen
		const timer = setTimeout(storeForOffline, 2500);

		return () => {
			stopWatching();
			clearTimeout(timer);
		};
	});
</script>

<OfflineBar />
{@render children()}
