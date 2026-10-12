<script lang="ts">
	import { network } from '#lib/network.svelte.ts';

	const dateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' });
</script>

{#if network.isOffline}
	<p class="offline" role="status">
		<span class="offline__state">
			<svg
				width="10"
				height="10"
				viewBox="0 0 10 10"
				fill="none"
				stroke="currentColor"
				stroke-width="1.3"
				aria-hidden="true"
			>
				<circle cx="5" cy="5" r="3.5" />
			</svg>
			Offline – saved version
		</span>
		{#if network.lastOnline}
			<span class="offline__date">As of {dateFormat.format(network.lastOnline)}</span>
		{/if}
	</p>
{/if}

<style lang="scss">
	@use '../styles/layout' as *;

	.offline {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-3);
		min-height: var(--status-height);
		padding-inline: var(--page-margin);
		background: var(--color-surface);
		font-size: var(--font-sub);

		@include from($desktop) {
			padding-inline: calc((100% - var(--column-width)) / 2);
		}
	}

	.offline__state {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.offline__date {
		flex: none;
		color: var(--color-grey-on-surface);
	}
</style>
