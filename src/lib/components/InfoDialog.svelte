<script lang="ts">
	import { resolve } from '$app/paths';
	import Icon from './Icon.svelte';
	import LegalLinks from './LegalLinks.svelte';
	import { emailLabel, instagramUrl, settings } from '#lib/settings.ts';

	let dialog: HTMLDialogElement;

	export function open() {
		dialog.showModal();
	}
</script>

<dialog class="info" bind:this={dialog} aria-labelledby="info-name">
	<div class="info__sheet">
		<div class="info__bar">
			<button type="button" class="info__close" aria-label="Close" onclick={() => dialog.close()}>
				<span class="info__close-label">Close</span>
				<Icon name="close" stroke={1.4} />
			</button>
		</div>

		<div class="info__body">
			<h2 id="info-name">{settings.name}</h2>
			<p class="info__sub">Video &amp; Photography, {settings.city}</p>

			<p class="info__lead">
				[Two or three sentences about you and your work: what you work on, with what means and
				for whom.]
			</p>

			<div class="info__columns">
				<section>
					<h3 class="info__heading">Exhibitions &amp; Screenings</h3>
					<ul class="info__list">
						<li><span class="info__year">[Year]</span>[Title, place]</li>
						<li><span class="info__year">[Year]</span>[Title, place]</li>
						<li><span class="info__year">[Year]</span>[Title, place]</li>
					</ul>
				</section>
				<section>
					<h3 class="info__heading">Clients &amp; Publications</h3>
					<ul class="info__list">
						<li><span class="info__year">[Year]</span>[Name / magazine]</li>
						<li><span class="info__year">[Year]</span>[Name / magazine]</li>
						<li><span class="info__year">[Year]</span>[Name / magazine]</li>
					</ul>
				</section>
				<section class="info__contact">
					<h3 class="info__heading info__heading--tight">Contact</h3>
					<a class="info__link" href={resolve('/contact')}>{emailLabel}</a>
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- externer Link -->
					<a class="info__link" href={instagramUrl} target="_blank" rel="noopener noreferrer">
						@{settings.instagramHandle} on Instagram
					</a>
					<p class="info__note">
						[Optional: what you can be booked for – e.g. music video, editorial, exhibition]
					</p>
				</section>
			</div>
		</div>

		<footer class="info__footer">
			<LegalLinks />
		</footer>
	</div>
</dialog>

<style lang="scss">
	@use '../styles/layout' as *;

	.info {
		width: 100%;
		max-width: none;
		height: 100dvh;
		max-height: none;
		margin: 0;
		padding: 0;
		border: 0;
		background: var(--color-wall);
		color: var(--color-ink);
		overscroll-behavior: contain;

		&[open] {
			animation: info-in var(--duration-move) var(--ease);
		}
	}

	@keyframes info-in {
		from {
			opacity: 0;
		}
	}

	.info__sheet {
		display: flex;
		flex-direction: column;
		min-height: 100%;
	}

	.info__bar {
		@include column;
		display: flex;
		justify-content: flex-end;
		padding-top: var(--space-4);

		@include from($tablet) {
			padding-top: var(--space-7);
		}
	}

	.info__close {
		@include link-button;
		gap: var(--space-2);
		justify-content: center;
		min-width: var(--tap);
		// das Kreuz steht auf der Kante der Spalte, die Tap-Fläche ragt darüber
		margin-right: calc(var(--space-3) * -1);

		@include from($tablet) {
			margin-right: 0;
		}
	}

	.info__close-label {
		display: none;

		@include from($tablet) {
			display: inline;
		}
	}

	.info__body {
		@include column;
		flex: 1 1 auto;
		margin-top: var(--space-2);

		@include from($tablet) {
			margin-top: var(--space-8);
		}
	}

	.info__sub {
		color: var(--color-grey);
	}

	.info__lead {
		max-width: var(--info-measure);
		margin-top: var(--space-7);
		font-size: var(--font-lead);
		line-height: var(--line-height-lead);
		text-wrap: pretty;

		@include from($tablet) {
			margin-top: var(--space-9);
		}
	}

	.info__columns {
		display: grid;
		gap: var(--space-7);
		margin-top: var(--space-8);

		@include from($tablet) {
			margin-top: var(--space-10);
		}

		@include from($desktop) {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	.info__heading {
		margin: 0 0 var(--space-2);
		font-size: inherit;
		font-weight: 600;

		@include from($tablet) {
			margin-bottom: var(--space-3);
		}

		&--tight {
			margin-bottom: 0;
		}
	}

	.info__list {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.info__year {
		margin-right: var(--space-3);
		color: var(--color-grey);
	}

	.info__contact {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.info__link {
		display: flex;
		align-items: center;
		min-height: var(--tap);
	}

	.info__note {
		margin-top: var(--space-2);
		color: var(--color-grey);
	}

	.info__footer {
		@include column;
		margin-top: var(--space-6);
		padding-bottom: var(--space-4);
	}
</style>
