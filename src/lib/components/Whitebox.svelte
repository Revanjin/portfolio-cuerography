<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from './Icon.svelte';
	import { largeSrc } from '#lib/media.ts';
	import { photoNumber, photos } from '#lib/photos.ts';
	import { attachGestures } from '#lib/whitebox/gestures.ts';

	interface Props {
		index: number;
		thumbnailOf: (index: number) => string;
		onClose: () => void;
	}

	let { index = $bindable(), thumbnailOf, onClose }: Props = $props();

	let root: HTMLDivElement;
	let stage: HTMLDivElement;
	let frame: HTMLButtonElement;
	let canvas: HTMLSpanElement;
	let gestures: ReturnType<typeof attachGestures> | undefined;

	let zoom = $state(1);
	let canFullscreen = $state(false);
	let isFullscreen = $state(false);

	const photo = $derived(photos[index]);
	const previous = $derived((index - 1 + photos.length) % photos.length);
	const next = $derived((index + 1) % photos.length);

	function turn(direction: 1 | -1) {
		index = direction === 1 ? next : previous;
		zoom = 1;
		gestures?.reset();

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		frame.animate(
			[{ opacity: 0, transform: `translateX(${direction * 32}px)` }, { opacity: 1, transform: 'none' }],
			{ duration: 300, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' }
		);
	}

	function onToggleFullscreen() {
		if (document.fullscreenElement) document.exitFullscreen();
		else root.requestFullscreen().catch(() => {});
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.ctrlKey || event.metaKey || event.altKey) return;

		if (event.key === 'Escape') onClose();
		else if (event.key === 'ArrowLeft') turn(-1);
		else if (event.key === 'ArrowRight') turn(1);
		else if (event.key.toLowerCase() === 'f' && canFullscreen) onToggleFullscreen();
	}

	onMount(() => {
		// das iPhone kennt requestFullscreen nur für Videos: dort entfällt der Knopf
		canFullscreen = document.fullscreenEnabled && typeof root.requestFullscreen === 'function';
		root.focus();

		gestures = attachGestures(
			{ stage, frame, canvas },
			{ onTurn: turn, onDismiss: onClose, onZoom: (scale) => (zoom = scale) }
		);

		const onFullscreenChange = () => (isFullscreen = document.fullscreenElement === root);
		document.addEventListener('fullscreenchange', onFullscreenChange);

		return () => {
			gestures?.destroy();
			document.removeEventListener('fullscreenchange', onFullscreenChange);
			if (document.fullscreenElement) document.exitFullscreen();
		};
	});

	// Nur die beiden Nachbarn vorladen, nicht die ganze Serie.
	$effect(() => {
		for (const neighbour of [previous, next]) {
			const image = new Image();
			image.crossOrigin = 'anonymous';
			image.src = largeSrc(photos[neighbour]);
		}
	});
</script>

<svelte:window onkeydown={onKeydown} />

<div
	class="whitebox"
	bind:this={root}
	role="dialog"
	aria-modal="true"
	aria-label="Photography, photo {photoNumber(index)} of {photos.length}"
	tabindex="-1"
>
	<header class="whitebox__bar">
		<p class="whitebox__counter">
			{photoNumber(index)} <span class="whitebox__total">/ {photos.length}</span>
		</p>
		<div class="whitebox__actions">
			{#if canFullscreen}
				<button
					type="button"
					class="whitebox__action"
					aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
					aria-pressed={isFullscreen}
					onclick={onToggleFullscreen}
				>
					<Icon name={isFullscreen ? 'collapse' : 'expand'} />
					<span class="whitebox__action-label">{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</span>
				</button>
			{/if}
			<button type="button" class="whitebox__action" aria-label="Close" onclick={onClose}>
				<span class="whitebox__action-label">Close</span>
				<Icon name="close" stroke={1.4} />
			</button>
		</div>
	</header>

	<div class="whitebox__stage" bind:this={stage} style:--ratio={photo.width / photo.height}>
		<figure class="whitebox__figure">
			<button
				type="button"
				class="whitebox__frame"
				class:whitebox__frame--zoomed={zoom > 1}
				bind:this={frame}
				style:--tone={photo.dominantColor}
				aria-label={zoom > 1 ? 'Reset zoom' : 'Zoom'}
			>
				<span class="whitebox__canvas" bind:this={canvas}>
					{#key photo.id}
						<img class="whitebox__image" src={thumbnailOf(index)} alt="" crossorigin="anonymous" />
						<img
							class="whitebox__image"
							src={largeSrc(photo)}
							alt={photo.title}
							decoding="async"
							crossorigin="anonymous"
						/>
					{/key}
				</span>
				{#if zoom > 1}
					<span class="whitebox__zoom">{Math.round(zoom * 100)} %</span>
				{/if}
			</button>
			<figcaption class="whitebox__caption">
				<p class="whitebox__text">
					<span class="whitebox__title">{photo.title}</span>
					<span class="whitebox__year">Photography, {photo.year}</span>
				</p>
				<p class="whitebox__hint whitebox__hint--touch">
					Double-tap or two fingers: zoom · swipe: browse · swipe down: close
				</p>
				<p class="whitebox__hint whitebox__hint--keys">
					Click: zoom · ← →: browse · Esc: close
				</p>
			</figcaption>
		</figure>
	</div>

	<nav class="whitebox__nav" aria-label="Browse photos">
		<button
			type="button"
			class="whitebox__turn whitebox__turn--previous"
			aria-label="Previous photo"
			onclick={() => turn(-1)}
		>
			<Icon name="previous" />
			<span class="whitebox__turn-number">{photoNumber(previous)}</span>
		</button>
		<div class="whitebox__ticks" aria-hidden="true">
			{#each photos as tick, tickIndex (tick.id)}
				<span class="whitebox__tick" class:whitebox__tick--current={tickIndex === index}></span>
			{/each}
		</div>
		<button
			type="button"
			class="whitebox__turn whitebox__turn--next"
			aria-label="Next photo"
			onclick={() => turn(1)}
		>
			<span class="whitebox__turn-number">{photoNumber(next)}</span>
			<Icon name="next" />
		</button>
	</nav>
</div>

<style lang="scss">
	@use '../styles/layout' as *;

	.whitebox {
		position: fixed;
		inset: 0;
		z-index: 10;
		display: grid;
		grid-template-rows: var(--whitebox-bar) minmax(0, 1fr) var(--whitebox-nav);
		padding-bottom: env(safe-area-inset-bottom);
		background: var(--color-wall);
		animation: whitebox-in var(--duration-move) var(--ease);

		&:focus {
			outline: none;
		}
	}

	@keyframes whitebox-in {
		from {
			opacity: 0;
		}
	}

	.whitebox__bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 var(--space-1) 0 var(--space-6);

		@include from($tablet) {
			padding: 0 var(--space-6) 0 var(--space-8);
		}
	}

	.whitebox__counter {
		font-variant-numeric: tabular-nums;
	}

	.whitebox__total {
		color: var(--color-grey);
	}

	.whitebox__actions {
		display: flex;
		align-items: center;

		@include from($tablet) {
			gap: var(--space-2);
		}
	}

	.whitebox__action {
		@include link-button;
		justify-content: center;
		gap: var(--space-2);
		min-width: var(--tap);
		text-decoration: none;

		@include from($tablet) {
			padding-inline: var(--space-3);
		}
	}

	.whitebox__action-label {
		display: none;

		@include from($tablet) {
			display: inline;
		}
	}

	// Die Fläche zwischen Kopf und Fuß. Das Foto passt sich über Container-Einheiten ein:
	// volle Breite oder, wenn es dafür zu hoch wäre, volle Höhe abzüglich der Beschriftung.
	.whitebox__stage {
		display: flex;
		container-type: size;
		touch-action: none;
		user-select: none;
	}

	.whitebox__figure {
		--photo-width: min(
			calc(100cqw - 2 * var(--whitebox-gutter)),
			calc((100cqh - var(--whitebox-caption)) * var(--ratio))
		);
		display: flex;
		flex-direction: column;
		width: 100%;

		@include from($tablet) {
			width: var(--photo-width);
			margin: auto;
		}
	}

	.whitebox__frame {
		position: relative;
		flex: none;
		width: var(--photo-width);
		aspect-ratio: var(--ratio);
		margin: auto;
		padding: 0;
		border: 0;
		overflow: hidden;
		background: var(--tone);
		cursor: zoom-in;
		transition:
			transform var(--duration-move) var(--ease),
			opacity var(--duration-move) var(--ease);

		&--zoomed {
			cursor: zoom-out;
		}

		&:focus-visible {
			outline-offset: -2px;
		}

		@include from($tablet) {
			margin: 0;
		}
	}

	.whitebox__canvas {
		position: absolute;
		inset: 0;
		transform-origin: 0 0;
		transition: transform var(--duration-move) var(--ease);
	}

	.whitebox__image {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none;
	}

	.whitebox__zoom {
		position: absolute;
		top: var(--space-3);
		right: var(--space-3);
		padding: 0 var(--space-2);
		background: color-mix(in srgb, var(--color-wall) 92%, transparent);
		color: var(--color-ink);
		font-size: var(--font-hint);
		font-variant-numeric: tabular-nums;
	}

	.whitebox__caption {
		flex: none;
		min-height: var(--whitebox-caption);
		padding: var(--space-2) var(--space-6) 0;

		@include from($tablet) {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			gap: var(--space-1) var(--space-6);
			flex-wrap: wrap;
			padding: var(--space-3) 0 0;
		}
	}

	.whitebox__text {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.whitebox__title {
		@include truncate;
		font-weight: 600;
	}

	.whitebox__year,
	.whitebox__hint {
		color: var(--color-grey);
	}

	.whitebox__hint {
		margin-top: var(--space-2);
		font-size: var(--font-hint);

		@include from($tablet) {
			margin-top: 0;
			font-size: inherit;
		}

		// Tastaturhinweis nur, wo es Maus und Tastatur gibt; sonst der Gestenhinweis
		&--keys {
			display: none;
		}

		@media (hover: hover) and (pointer: fine) {
			&--touch {
				display: none;
			}

			&--keys {
				display: block;
			}
		}
	}

	.whitebox__nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-inline: var(--space-3);

		@include from($tablet) {
			justify-content: center;
		}
	}

	.whitebox__turn {
		@include plain-button;
		gap: var(--caption-gap);
		padding-inline: var(--space-3);
		font-variant-numeric: tabular-nums;
		transition: color var(--duration-micro) var(--ease);

		&:hover {
			color: var(--color-grey);
		}

		&:active {
			transform: scale(0.94);
		}

		@include from($tablet) {
			position: absolute;
			top: 50%;
			justify-content: center;
			width: var(--whitebox-arrow);
			height: var(--whitebox-arrow);
			margin-top: calc(var(--whitebox-arrow) / -2);
			padding: 0;

			&--previous {
				left: var(--space-6);
			}

			&--next {
				right: var(--space-6);
			}

			:global(svg) {
				width: var(--whitebox-arrow-icon);
				height: var(--whitebox-arrow-icon);
				stroke-width: 0.9;
			}
		}
	}

	.whitebox__turn-number {
		@include from($tablet) {
			display: none;
		}
	}

	.whitebox__ticks {
		display: flex;
		gap: var(--space-1);
	}

	.whitebox__tick {
		width: var(--whitebox-tick);
		height: 2px;
		background: var(--color-line);

		&--current {
			background: var(--color-ink);
		}
	}
</style>
