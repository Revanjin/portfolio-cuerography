<script lang="ts">
	import '#lib/styles/base.scss';
	import { onMount } from 'svelte';
	import OfflineBar from '#lib/components/OfflineBar.svelte';
	import { storeForOffline, watchNetwork } from '#lib/network.svelte.ts';

	let { children } = $props();

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
