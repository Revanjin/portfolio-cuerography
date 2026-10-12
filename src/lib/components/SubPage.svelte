<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';
	import LegalLinks from './LegalLinks.svelte';
	import Seo from './Seo.svelte';
	import { settings } from '#lib/settings.ts';

	interface Props {
		title: string;
		description?: string;
		noindex?: boolean;
		children: Snippet;
	}

	let { title, description, noindex, children }: Props = $props();
</script>

<Seo title="{title} – {settings.name}" {description} {noindex} />

<header class="sub-page__header">
	<a class="sub-page__home" href={resolve('/')}>{settings.name}</a>
</header>

<main class="sub-page__main">
	<h1>{title}</h1>
	<div class="sub-page__text">
		{@render children()}
	</div>
</main>

<footer class="sub-page__footer">
	<LegalLinks />
</footer>

<style lang="scss">
	@use '../styles/layout' as *;

	.sub-page__header {
		@include column;
		padding-top: var(--header-top);
	}

	.sub-page__home {
		display: inline-flex;
		align-items: center;
		min-height: var(--tap);
		font-weight: 600;
	}

	.sub-page__main {
		@include column;
		margin-top: var(--header-to-video);
	}

	.sub-page__text {
		max-width: var(--text-measure);
		margin-top: var(--space-6);
	}

	.sub-page__footer {
		@include column;
		margin-top: var(--footer-top);
		padding-bottom: var(--page-bottom);
	}
</style>
