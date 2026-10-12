<script lang="ts">
	import { resolve } from '$app/paths';
	import LegalLinks from './LegalLinks.svelte';
	import { emailLabel } from '#lib/settings.ts';

	interface Props {
		onInfo: () => void;
	}

	let { onInfo }: Props = $props();
</script>

<footer class="footer">
	<div class="footer__contact">
		<a class="footer__link" href={resolve('/contact')}>{emailLabel}</a>
		<button type="button" class="footer__info" onclick={onInfo}>Info</button>
	</div>
	<LegalLinks stacked />
</footer>

<style lang="scss">
	@use '../styles/layout' as *;

	.footer {
		@include column;
		margin-top: var(--footer-top);

		@include from($tablet) {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			gap: var(--space-6);
		}
	}

	.footer__contact {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.footer__link {
		display: flex;
		align-items: center;
		min-height: var(--tap);
	}

	.footer__info {
		@include link-button;
		min-width: var(--tap);
	}
</style>
