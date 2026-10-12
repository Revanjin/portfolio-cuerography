<script lang="ts">
	import { tick } from 'svelte';
	import InfoDialog from '#lib/components/InfoDialog.svelte';
	import InstagramBlock from '#lib/components/InstagramBlock.svelte';
	import PhotoSection from '#lib/components/PhotoSection.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import SiteFooter from '#lib/components/SiteFooter.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import VideoWork from '#lib/components/VideoWork.svelte';
	import { previewSrc } from '#lib/media.ts';
	import { photos } from '#lib/photos.ts';
	import { instagramUrl, settings } from '#lib/settings.ts';

	type Whitebox = typeof import('#lib/components/Whitebox.svelte').default;

	// Sagt Suchmaschinen, wer hinter der Seite steht und dass das Instagram-Profil dazugehört.
	const structuredData = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: settings.name,
		url: settings.siteUrl,
		image: `${settings.siteUrl}/og.jpg`,
		jobTitle: 'Video artist and photographer',
		sameAs: [instagramUrl]
	});

	let info = $state<InfoDialog>();
	let Whitebox = $state<Whitebox>();
	let isWhiteboxOpen = $state(false);
	let whiteboxIndex = $state(0);
	let opener: HTMLElement | undefined;

	// Whitebox und Gesten kommen erst mit dem ersten Klick auf ein Foto.
	async function onOpenPhoto(index: number, trigger: HTMLElement) {
		opener = trigger;
		whiteboxIndex = index;
		Whitebox ??= (await import('#lib/components/Whitebox.svelte')).default;
		isWhiteboxOpen = true;
	}

	async function onCloseWhitebox() {
		isWhiteboxOpen = false;
		// die Seite ist bis zum nächsten Render noch inert und nimmt keinen Fokus an
		await tick();
		opener?.focus({ preventScroll: true });
	}

	// Die Vorschau, die der Browser schon geladen hat, steht sofort da, bis das große Foto kommt.
	function thumbnailOf(index: number) {
		const loaded = [...document.querySelectorAll<HTMLImageElement>(`[data-photo="${index}"] img`)];
		return loaded.find((image) => image.complete && image.currentSrc)?.currentSrc ?? previewSrc(photos[index]);
	}
</script>

<Seo title="{settings.name} – Video & Photography" />

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- eigene Konstanten, kein Fremdinhalt -->
	{@html `<script type="application/ld+json">${structuredData}</${'script'}>`}
</svelte:head>

<div class="page" inert={isWhiteboxOpen}>
	<SiteHeader onInfo={() => info?.open()} />
	<main>
		<VideoWork />
		<PhotoSection onOpen={onOpenPhoto} />
		<InstagramBlock />
	</main>
	<SiteFooter onInfo={() => info?.open()} />
	<InfoDialog bind:this={info} />
</div>

{#if Whitebox && isWhiteboxOpen}
	<Whitebox bind:index={whiteboxIndex} {thumbnailOf} onClose={onCloseWhitebox} />
{/if}

<style lang="scss">
	.page {
		padding-bottom: calc(var(--page-bottom) + env(safe-area-inset-bottom));
	}
</style>
