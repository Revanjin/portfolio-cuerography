<script lang="ts">
	import { instagramUrl, settings } from '#lib/settings.ts';
</script>

<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- externer Link -->
<a class="instagram" href={instagramUrl} target="_blank" rel="noopener noreferrer">
	<span class="instagram__text">
		<span class="instagram__lead">More on Instagram</span>
		<span class="instagram__handle">@{settings.instagramHandle}</span>
	</span>
	<svg
		class="instagram__arrow"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-width="0.9"
		aria-hidden="true"
	>
		<path d="M5 11L11 5M6 5h5v5" />
	</svg>
</a>

<style lang="scss">
	@use '../styles/layout' as *;

	.instagram {
		@include column;
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: var(--space-3);
		margin-top: var(--photos-to-instagram);
		padding-block: var(--instagram-padding);
		border-block: 1px solid var(--color-ink);
		text-decoration: none;

		@include from($tablet) {
			gap: var(--space-6);
		}
	}

	.instagram__text {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-width: 0;

		@include from($tablet) {
			gap: var(--space-3);
		}
	}

	.instagram__lead {
		color: var(--color-grey);
	}

	.instagram__handle {
		font-size: var(--font-handle);
		font-weight: 500;
		line-height: var(--line-height-handle);
		letter-spacing: var(--tracking-handle);
		overflow-wrap: anywhere;
	}

	.instagram__arrow {
		flex: none;
		width: var(--instagram-arrow);
		height: var(--instagram-arrow);
		transition: transform var(--duration-move) var(--ease);

		.instagram:hover & {
			transform: translate(4px, -4px);
		}

		.instagram:active & {
			transform: translate(6px, -6px);
		}
	}
</style>
