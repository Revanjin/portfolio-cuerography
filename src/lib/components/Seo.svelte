<script lang="ts">
	import { page } from '$app/state';
	import { settings } from '#lib/settings.ts';

	interface Props {
		title: string;
		description?: string;
		// Seiten ohne eigenen Inhalt für Suchende, etwa Impressum und Datenschutz
		noindex?: boolean;
	}

	let { title, description = settings.description, noindex = false }: Props = $props();

	const canonical = $derived(settings.siteUrl + page.url.pathname.replace(/\/$/, ''));
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	{#if noindex}
		<meta name="robots" content="noindex, follow" />
	{/if}

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={settings.name} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content="{settings.siteUrl}/og.jpg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content="en" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>
