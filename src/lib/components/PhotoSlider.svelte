<script lang="ts">
	import PhotoFigure from './PhotoFigure.svelte';
	import { photos } from '#lib/photos.ts';

	interface Props {
		current: number;
		onOpen: (index: number, trigger: HTMLElement) => void;
	}

	let { current = $bindable(), onOpen }: Props = $props();

	let strip: HTMLDivElement;

	function sizesFor(ratio: number) {
		const width = (height: number) => `${Math.round(height * ratio)}px`;
		return `(min-width: 1024px) ${width(420)}, (min-width: 720px) ${width(360)}, ${width(300)}`;
	}

	function slides() {
		return [...strip.children] as HTMLElement[];
	}

	function onScroll() {
		const items = slides();
		const start = items[0].offsetLeft;
		const isAtEnd = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 4;

		current = isAtEnd
			? items.length - 1
			: items.findLastIndex((item) => item.offsetLeft - start <= strip.scrollLeft + 8);
	}

	export function go(direction: 1 | -1) {
		const items = slides();
		const target = items[Math.max(0, Math.min(items.length - 1, current + direction))];
		strip.scrollTo({ left: target.offsetLeft - items[0].offsetLeft, behavior: 'smooth' });
	}
</script>

<div class="slider" bind:this={strip} onscroll={onScroll}>
	{#each photos as photo, index (photo.id)}
		<PhotoFigure
			{photo}
			{index}
			{onOpen}
			layout="strip"
			sizes={sizesFor(photo.width / photo.height)}
		/>
	{/each}
</div>

<style lang="scss">
	@use '../styles/layout' as *;

	// Der Streifen läuft randlos, das erste Foto startet auf der Flucht der Inhaltsspalte.
	.slider {
		--inset: var(--page-margin);
		display: flex;
		align-items: flex-start;
		gap: var(--slider-gap);
		padding-inline: var(--inset);
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scroll-padding-left: var(--inset);
		scrollbar-width: none;

		&::-webkit-scrollbar {
			display: none;
		}

		@include from($desktop) {
			--inset: calc((100% - var(--column-width)) / 2);
		}
	}
</style>
