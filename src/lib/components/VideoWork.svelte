<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from './Icon.svelte';
	import { poster, posterTallSrcset, posterWideSrc, posterWideSrcset } from '#lib/media.ts';
	import { network } from '#lib/network.svelte.ts';
	import { settings } from '#lib/settings.ts';

	const WIDE = '/video/loop-16x9.mp4';
	const PHONE = '/video/loop-4x5.mp4';
	const PHONE_LOW = '/video/loop-4x5-low.mp4';
	const SLOW_DOWNLINK = 1.5;

	const hasPhoneCut = settings.video.mode === 'two';

	let video = $state<HTMLVideoElement>();
	let isMounted = $state(false);
	let hasFailed = $state(false);
	let prefersReducedMotion = $state(false);
	let isMuted = $state(true);
	let isPaused = $state(true);
	let readySrc = $state<string | null>(null);
	let playingSrc = $state<string | null>(null);

	const src = $derived(isMounted && !hasFailed ? pickSource(network.isOffline) : null);
	const isReady = $derived(src !== null && readySrc === src);
	const isShown = $derived(src !== null && playingSrc === src);

	function pickSource(isOffline: boolean) {
		const isPhone = !window.matchMedia('(min-width: 720px)').matches;
		if (isOffline) return isPhone && settings.video.offline ? PHONE : null;
		if (!isPhone) return WIDE;

		// Safari und Firefox kennen navigator.connection nicht, dort gilt die normale Handy-Datei
		const { connection } = navigator;
		if (connection?.saveData) return null;
		if (!hasPhoneCut) return WIDE;

		const isSlow =
			(connection?.downlink !== undefined && connection.downlink < SLOW_DOWNLINK) ||
			/2g|3g/.test(connection?.effectiveType ?? '');
		return isSlow ? PHONE_LOW : PHONE;
	}

	function autoplay(node: HTMLVideoElement) {
		if (prefersReducedMotion) return;
		// lehnt ab, wenn der Browser Autoplay sperrt oder die Datei fehlt: dann bleibt das Poster
		node.play().catch(() => {});
	}

	function onTogglePlay() {
		if (video?.paused) video.play().catch(() => {});
		else video?.pause();
	}

	function onFullscreen() {
		if (!video) return;
		// das iPhone kennt Vollbild nur für Videos und nur über die eigene Methode
		if (video.requestFullscreen) video.requestFullscreen().catch(() => {});
		else video.webkitEnterFullscreen?.();
	}

	onMount(() => {
		prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		isMounted = true;
	});
</script>

<figure class="work">
	<div
		class="work__frame"
		class:work__frame--phone-cut={hasPhoneCut}
		style:--tone={poster.wide.dominantColor}
	>
		<picture>
			{#if hasPhoneCut}
				<source
					media="(max-width: 719px)"
					srcset={posterTallSrcset}
					sizes="calc(100vw - 48px)"
					width={poster.tall.width}
					height={poster.tall.height}
				/>
			{/if}
			<img
				class="work__poster"
				src={posterWideSrc}
				srcset={posterWideSrcset}
				sizes="(min-width: 1024px) 64vw, (min-width: 720px) calc(100vw - 96px), calc(100vw - 48px)"
				width={poster.wide.width}
				height={poster.wide.height}
				alt="Still from {settings.videoTitle}"
				fetchpriority="high"
				crossorigin="anonymous"
				data-offline
			/>
		</picture>
		{#if src}
			{#key src}
				<video
					bind:this={video}
					class="work__video"
					class:work__video--shown={isShown}
					{src}
					muted={isMuted}
					loop
					playsinline
					preload="metadata"
					onloadedmetadata={() => (readySrc = src)}
					onplaying={() => (playingSrc = src)}
					onplay={() => (isPaused = false)}
					onpause={() => (isPaused = true)}
					onerror={() => (hasFailed = true)}
					{@attach autoplay}
				></video>
			{/key}
		{/if}
	</div>
	<figcaption class="work__caption">
		<p class="work__title">
			<span class="work__name">{settings.videoTitle}, {settings.videoYear}</span>
			<span class="work__kind">— Video</span>
		</p>
		{#if network.isOffline && !src}
			<p class="work__note">Video not saved offline</p>
		{:else if isReady}
			<div class="work__controls">
				{#if prefersReducedMotion}
					<button type="button" class="work__button" onclick={onTogglePlay}>
						{isPaused ? 'Play' : 'Pause'}
					</button>
				{/if}
				<button
					type="button"
					class="work__button"
					aria-pressed={!isMuted}
					onclick={() => (isMuted = !isMuted)}
				>
					<Icon name={isMuted ? 'soundOff' : 'soundOn'} />
					{isMuted ? 'Sound on' : 'Sound off'}
				</button>
				<button
					type="button"
					class="work__button work__button--fullscreen"
					aria-label="Video in fullscreen"
					onclick={onFullscreen}
				>
					<Icon name="expand" />
					<span class="work__label">Fullscreen</span>
				</button>
			</div>
		{/if}
	</figcaption>
</figure>

<style lang="scss">
	@use '../styles/layout' as *;

	.work {
		@include column;
		margin-top: var(--header-to-video);
	}

	.work__frame {
		position: relative;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		background: var(--tone);

		&--phone-cut {
			aspect-ratio: 4 / 5;

			@include from($tablet) {
				aspect-ratio: 16 / 9;
			}
		}
	}

	.work__poster,
	.work__video {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.work__video {
		opacity: 0;
		transition: opacity var(--duration-move) var(--ease);

		&--shown {
			opacity: 1;
		}

		&:fullscreen {
			object-fit: contain;
		}
	}

	.work__caption {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-2);
		min-height: var(--tap);
		margin-top: var(--space-2);

		@include from($tablet) {
			gap: var(--space-5);
			margin-top: var(--space-3);
		}
	}

	.work__title {
		@include truncate;
	}

	.work__name {
		font-weight: 600;
	}

	.work__kind {
		display: none;
		color: var(--color-grey);

		@include from($tablet) {
			display: inline;
		}
	}

	.work__note {
		flex: none;
		color: var(--color-grey);
	}

	.work__controls {
		display: flex;
		flex: none;
		align-items: center;
		// die Tap-Fläche des letzten Knopfs ragt über die Kante, das Icon steht auf der Flucht
		margin-right: calc(var(--space-3) * -1);

		@include from($tablet) {
			gap: var(--space-5);
			margin-right: 0;
		}
	}

	.work__button {
		@include plain-button;
		gap: var(--space-2);
		padding-inline: var(--space-2);
		transition: color var(--duration-micro) var(--ease);

		&:hover {
			color: var(--color-grey);
		}

		&:active {
			transform: scale(0.97);
		}

		@include from($tablet) {
			padding-inline: 0;
		}

		&--fullscreen {
			justify-content: center;
			min-width: var(--tap);
		}
	}

	.work__label {
		display: none;

		@include from($tablet) {
			display: inline;
		}
	}
</style>
