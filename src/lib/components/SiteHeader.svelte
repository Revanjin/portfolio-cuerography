<script lang="ts">
	import Icon from './Icon.svelte';
	import { instagramUrl, settings } from '#lib/settings.ts';

	interface Props {
		onInfo: () => void;
	}

	let { onInfo }: Props = $props();
</script>

<header class="header">
	<div class="header__identity">
		<h1>{settings.name}</h1>
		<p class="header__sub">Video &amp; Photography, {settings.city}</p>
	</div>
	<nav class="header__nav" aria-label="Main navigation">
		<button type="button" class="header__info" onclick={onInfo}>Info</button>
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- externer Link -->
		<a class="header__instagram" href={instagramUrl} target="_blank" rel="noopener noreferrer">
			Instagram
			<Icon name="out" size={14} stroke={1.4} />
		</a>
	</nav>
</header>

<style lang="scss">
	@use '../styles/layout' as *;

	.header {
		@include column;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-3);
		padding-top: var(--header-top);

		@include from($tablet) {
			gap: var(--space-6);
		}
	}

	.header__identity {
		min-width: 0;
	}

	.header__sub {
		color: var(--color-grey);
		font-size: var(--font-sub);
	}

	.header__nav {
		display: flex;
		flex: none;
		align-items: center;
		gap: var(--space-5);

		@include from($desktop) {
			gap: var(--space-6);
		}
	}

	// auf dem Handy steht Info nur in der Fußzeile
	.header__info {
		@include link-button;
		display: none;
		justify-content: center;
		min-width: var(--tap);

		@include from($tablet) {
			display: flex;
		}
	}

	.header__instagram {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		min-height: var(--tap);
		padding-inline: var(--space-4);
		border: 1px solid var(--color-ink);
		border-radius: 999px;
		font-weight: 600;
		text-decoration: none;
		// die Füllung liegt hinter dem Text und wird von der Pille beschnitten
		position: relative;
		z-index: 0;
		overflow: hidden;
		transition: color var(--duration-move) var(--ease);

		&::before {
			content: '';
			position: absolute;
			inset: 0;
			z-index: -1;
			background: var(--color-ink);
			transform: scaleX(0);
			transform-origin: left;
			transition: transform var(--duration-move) var(--ease);
		}

		&:hover {
			color: var(--color-wall);

			&::before {
				transform: scaleX(1);
			}
		}

		&:active {
			transform: scale(0.97);
		}
	}
</style>
