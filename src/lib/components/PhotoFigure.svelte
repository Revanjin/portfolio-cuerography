<script lang="ts">
	import { previewSrc, previewSrcset } from '#lib/media.ts';
	import { photoNumber, type Photo } from '#lib/photos.ts';
	import { settings } from '#lib/settings.ts';

	interface Props {
		photo: Photo;
		index: number;
		sizes: string;
		layout?: 'column' | 'strip';
		onOpen: (index: number, trigger: HTMLElement) => void;
	}

	let { photo, index, sizes, layout = 'column', onOpen }: Props = $props();

	const number = $derived(photoNumber(index));
</script>

<figure
	class="photo"
	class:photo--strip={layout === 'strip'}
	style:--ratio={photo.width / photo.height}
>
	<button
		type="button"
		class="photo__open"
		style:--tone={photo.dominantColor}
		aria-label="Open photo {number} {photo.title}"
		data-photo={index}
		onclick={(event) => onOpen(index, event.currentTarget)}
	>
		<img
			class="photo__image"
			src={previewSrc(photo)}
			srcset={previewSrcset(photo)}
			{sizes}
			width={photo.width}
			height={photo.height}
			alt=""
			loading="lazy"
			decoding="async"
			crossorigin="anonymous"
			data-offline
		/>
	</button>
	{#if settings.captions}
		<figcaption class="photo__caption">
			<span class="photo__title"><span class="photo__number">{number}</span>{photo.title}</span>
			<span class="photo__year">{photo.year}</span>
		</figcaption>
	{/if}
</figure>

<style lang="scss">
	@use '../styles/layout' as *;

	.photo--strip {
		flex: none;
		width: calc(var(--slider-height) * var(--ratio));
		scroll-snap-align: start;
	}

	.photo__open {
		display: block;
		width: 100%;
		aspect-ratio: var(--ratio);
		padding: 0;
		border: 0;
		background: var(--tone);
		cursor: zoom-in;
	}

	.photo__image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: opacity var(--duration-micro) var(--ease);

		.photo__open:hover & {
			opacity: 0.9;
		}

		.photo__open:active & {
			opacity: 0.8;
		}
	}

	.photo__caption {
		display: flex;
		justify-content: space-between;
		gap: var(--space-3);
		margin-top: var(--caption-gap);
		font-size: var(--font-caption);
	}

	.photo__title {
		@include truncate;
	}

	.photo__number {
		margin-right: var(--caption-gap);
		color: var(--color-grey);
	}

	.photo__year {
		display: none;
		flex: none;
		color: var(--color-grey);

		@include from($tablet) {
			display: inline;
		}
	}
</style>
