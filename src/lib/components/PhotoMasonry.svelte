<script lang="ts">
	import PhotoFigure from './PhotoFigure.svelte';
	import { masonryLayouts } from '#lib/masonry.ts';
	import { photos } from '#lib/photos.ts';
	import { settings } from '#lib/settings.ts';

	interface Props {
		onOpen: (index: number, trigger: HTMLElement) => void;
	}

	let { onOpen }: Props = $props();

	const layouts = masonryLayouts(photos, settings.columnsDesktop, settings.captions);

	const desktopSize =
		settings.columnsDesktop === 3 ? 'calc((64vw - 64px) / 3)' : 'calc((64vw - 40px) / 2)';
	const sizes = `(min-width: 1024px) ${desktopSize}, (min-width: 720px) calc((100vw - 120px) / 2), calc((100vw - 60px) / 2)`;
</script>

{#each layouts as layout (layout.from)}
	<div
		class="masonry"
		class:masonry--two-wide={settings.columnsDesktop === 2}
		data-from={layout.from}
		data-until={layout.until}
	>
		{#each layout.columns as column, columnIndex (columnIndex)}
			<div class="masonry__column">
				{#each column as { photo, index } (photo.id)}
					<PhotoFigure {photo} {index} {sizes} {onOpen} />
				{/each}
			</div>
		{/each}
	</div>
{/each}

<style lang="scss">
	@use '../styles/layout' as *;

	// Je Breakpoint liegt eine fertige Verteilung im HTML; sichtbar ist immer genau eine.
	.masonry {
		@include column;
		display: none;
		align-items: flex-start;
		gap: var(--gallery-gap-x);

		&[data-from='0'] {
			display: flex;
		}

		@include from($tablet) {
			&[data-until='720'] {
				display: none;
			}

			&[data-from='720'] {
				display: flex;
			}
		}

		@include from($desktop) {
			&[data-until='1024'] {
				display: none;
			}

			&[data-from='1024'] {
				display: flex;
			}

			&--two-wide {
				gap: var(--space-8);
			}
		}
	}

	.masonry__column {
		display: flex;
		flex: 1 1 0;
		flex-direction: column;
		gap: var(--gallery-gap-y);
		min-width: 0;
	}
</style>
