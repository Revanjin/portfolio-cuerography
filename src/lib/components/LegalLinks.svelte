<script lang="ts">
	import { resolve } from '$app/paths';
	import { settings } from '#lib/settings.ts';

	interface Props {
		// ab Tablet-Breite © über den Links statt daneben
		stacked?: boolean;
	}

	let { stacked = false }: Props = $props();
</script>

<div class="legal" class:legal--stacked={stacked}>
	<p class="legal__copyright">© [Year]<span class="legal__name">&nbsp;{settings.name}</span></p>
	<p class="legal__links">
		<a class="legal__link" href={resolve('/imprint')}>Imprint</a>
		<a class="legal__link" href={resolve('/privacy')}>Privacy</a>
	</p>
</div>

<style lang="scss">
	@use '../styles/layout' as *;

	.legal {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-3);

		@include from($tablet) {
			&--stacked {
				flex-direction: column;
				align-items: flex-end;
				gap: 0;
			}
		}
	}

	.legal__copyright {
		display: flex;
		align-items: center;
		min-height: var(--tap);
		color: var(--color-grey);
	}

	.legal__name {
		display: none;

		@include from($tablet) {
			display: inline;
		}
	}

	.legal__links {
		display: flex;
		gap: var(--space-4);

		@include from($tablet) {
			gap: var(--space-5);
		}
	}

	.legal__link {
		display: flex;
		align-items: center;
		min-height: var(--tap);
	}
</style>
