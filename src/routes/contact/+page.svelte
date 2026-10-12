<script lang="ts">
	import { resolve } from '$app/paths';
	import SubPage from '#lib/components/SubPage.svelte';
	import { emailLabel, settings } from '#lib/settings.ts';

	const WEB3FORMS = 'https://api.web3forms.com/submit';
	// Ohne Schlüssel übergibt das Formular die Nachricht an das Mailprogramm, statt sie zu senden.
	const accessKey = import.meta.env.VITE_WEB3FORMS_KEY;

	let name = $state('');
	let email = $state('');
	let message = $state('');
	// Honeypot von Web3Forms: Menschen sehen das Feld nicht, Bots füllen es aus
	let botcheck = $state(false);
	let status = $state<'idle' | 'sending' | 'sent' | 'failed' | 'mail'>('idle');

	async function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		const subject = `Message from ${name}`;

		if (!accessKey) {
			window.location.href = `mailto:${settings.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
			status = 'mail';
			return;
		}

		status = 'sending';
		try {
			const response = await fetch(WEB3FORMS, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
				body: JSON.stringify({ access_key: accessKey, subject, name, email, message, botcheck })
			});
			const result = await response.json();
			status = response.ok && result.success ? 'sent' : 'failed';
		} catch {
			status = 'failed';
		}

		if (status === 'sent') message = '';
	}

	function onWriteDirectly() {
		window.location.href = `mailto:${settings.email}`;
	}
</script>

<SubPage
	title="Contact me"
	description="Get in touch with {settings.name} about commissions, collaborations or questions."
>
	<p class="contact__lead">
		Are you interested in working together? Do you have any questions or just want to say hi? Drop
		me a line by filling out the contact form below and I will get back to you as soon as I can.
	</p>

	<form class="contact__form" onsubmit={onSubmit}>
		<label class="contact__field">
			<span class="contact__label">Name</span>
			<input class="contact__input" type="text" autocomplete="name" required bind:value={name} />
		</label>
		{#if accessKey}
			<label class="contact__field">
				<span class="contact__label">Email</span>
				<input
					class="contact__input"
					type="email"
					inputmode="email"
					autocomplete="email"
					required
					bind:value={email}
				/>
			</label>
			<input type="checkbox" tabindex="-1" autocomplete="off" hidden bind:checked={botcheck} />
		{/if}
		<label class="contact__field">
			<span class="contact__label">Message</span>
			<textarea class="contact__input contact__input--text" rows="6" required bind:value={message}
			></textarea>
		</label>
		<button type="submit" class="contact__submit" disabled={status === 'sending'}>
			{status === 'sending' ? 'Sending …' : 'Send message'}
		</button>
		<p class="contact__note" class:contact__note--strong={status === 'sent' || status === 'failed'} role="status">
			{#if status === 'sent'}
				Thank you, your message has arrived. I will get back to you as soon as I can.
			{:else if status === 'failed'}
				The message could not be sent. Nothing you typed is lost: try again in a moment or write
				directly to the address below.
			{:else if status === 'mail'}
				Your message is now waiting in your mail app, just hit send there. If nothing opened, write
				directly to the address below.
			{:else if !accessKey}
				Opens your mail app with the finished message.
			{:else}
				Your name, email and message are sent via Web3Forms. Details in the
				<a href={resolve('/privacy')}>privacy policy</a>.
			{/if}
		</p>
	</form>

	<button type="button" class="contact__address" onclick={onWriteDirectly}>{emailLabel}</button>
</SubPage>

<style lang="scss">
	@use '../../lib/styles/layout' as *;

	.contact__lead {
		max-width: var(--info-measure);
		font-size: var(--font-lead);
		line-height: var(--line-height-lead);
		text-wrap: pretty;
	}

	.contact__form {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-6);
		max-width: var(--form-measure);
		margin-top: var(--space-9);
	}

	.contact__field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		width: 100%;
	}

	.contact__label {
		color: var(--color-grey);
	}

	.contact__input {
		width: 100%;
		min-height: var(--tap);
		padding: var(--space-2) 0;
		border: 0;
		border-bottom: 1px solid var(--color-underline);
		border-radius: 0;
		background: transparent;
		color: var(--color-ink);
		// 16 px, sonst zoomt iOS beim Antippen in das Feld
		font: inherit;
		font-size: var(--font-input);
		transition: border-color var(--duration-micro) var(--ease);

		&:hover {
			border-bottom-color: var(--color-grey);
		}

		&:focus-visible {
			outline: none;
			border-bottom-color: var(--color-ink);
			box-shadow: 0 1px 0 var(--color-ink);
		}

		&--text {
			resize: vertical;
		}
	}

	.contact__submit {
		@include plain-button;
		padding-inline: var(--space-5);
		border: 1px solid var(--color-ink);
		font-weight: 600;
		transition:
			background-color var(--duration-micro) var(--ease),
			color var(--duration-micro) var(--ease);

		&:hover {
			background-color: var(--color-ink);
			color: var(--color-wall);
		}

		&:active {
			transform: scale(0.97);
		}

		&:disabled {
			border-color: var(--color-underline);
			background-color: transparent;
			color: var(--color-grey);
			cursor: default;
		}
	}

	.contact__note {
		// der Platz bleibt reserviert, damit die Rückmeldung nichts verschiebt
		min-height: calc(var(--font-base) * var(--line-height) * 2);
		color: var(--color-grey);

		&--strong {
			color: var(--color-ink);
		}
	}

	.contact__address {
		@include link-button;
		margin-top: var(--space-8);
	}
</style>
