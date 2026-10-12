<script lang="ts">
	import Icon from './Icon.svelte';
	import PhotoMasonry from './PhotoMasonry.svelte';
	import PhotoSlider from './PhotoSlider.svelte';
	import { network } from '#lib/network.svelte.ts';
	import { photoNumber, photos } from '#lib/photos.ts';
	import { settings } from '#lib/settings.ts';

	interface Props {
		onOpen: (index: number, trigger: HTMLElement) => void;
	}

	let { onOpen }: Props = $props();

	const isSlider = settings.gallery === 'slider';

	let slider = $state<PhotoSlider>();
	let current = $state(0);
</script>

<section class="photos" aria-labelledby="photos-title">
	<div class="photos__head">
		<h2 id="photos-title">
			Photography
			<span class="photos__count">
				{photos.length}{#if network.isOffline}&nbsp;· saved{/if}
			</span>
		</h2>
		{#if isSlider}
			<div class="photos__pager">
				<p class="photos__counter">
					{photoNumber(current)} / {photos.length}<span class="photos__swipe">&nbsp;· swipe</span>
				</p>
				<button
					type="button"
					class="photos__arrow"
					aria-label="Previous photo"
					disabled={current === 0}
					onclick={() => slider?.go(-1)}
				>
					<Icon name="previous" size={20} stroke={1} />
				</button>
				<button
					type="button"
					class="photos__arrow"
					aria-label="Next photo"
					disabled={current === photos.length - 1}
					onclick={() => slider?.go(1)}
				>
					<Icon name="next" size={20} stroke={1} />
				</button>
			</div>
		{/if}
	</div>
	{#if isSlider}
		<PhotoSlider bind:this={slider} bind:current {onOpen} />
	{:else}
		<PhotoMasonry {onOpen} />
	{/if}
</section>

<style lang="scss">
	@use '../styles/layout' as *;

	.photos {
		margin-top: var(--video-to-photos);
	}

	.photos__head {
		@include column;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-6);
		min-height: var(--tap);
		margin-bottom: var(--space-3);

		@include from($tablet) {
			margin-bottom: var(--space-5);
		}

		@include from($desktop) {
			margin-bottom: var(--space-6);
		}
	}

	.photos__count {
		color: var(--color-grey);
		font-weight: 400;
	}

	.photos__pager {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	.photos__counter {
		color: var(--color-grey);
		font-variant-numeric: tabular-nums;

		@include from($desktop) {
			margin-right: var(--space-3);
		}
	}

	.photos__swipe {
		display: none;

		@include from($tablet) {
			display: inline;
		}

		@include from($desktop) {
			display: none;
		}
	}

	.photos__arrow {
		@include icon-button;
		display: none;

		&:disabled {
			color: var(--color-underline);
			cursor: default;
		}

		@include from($desktop) {
			display: flex;
		}
	}
</style>
