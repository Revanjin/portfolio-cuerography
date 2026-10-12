<script lang="ts">
	const paths = {
		out: 'M5 11L11 5M6 5h5v5',
		soundOff: 'M2 6h2.5L8 3v10L4.5 10H2zM11 6l4 4M15 6l-4 4',
		soundOn: 'M2 6h2.5L8 3v10L4.5 10H2zM10.5 5.5a3.5 3.5 0 0 1 0 5M12.5 3.5a6.3 6.3 0 0 1 0 9',
		expand: 'M9.5 2.5h4v4M13.5 2.5l-5 5M6.5 13.5h-4v-4M2.5 13.5l5-5',
		collapse: 'M13.5 6.5h-4v-4M9.5 6.5l5-5M2.5 9.5h4v4M6.5 9.5l-5 5',
		close: 'M3 3l10 10M13 3L3 13',
		previous: 'M13 8H3M7 4L3 8l4 4',
		next: 'M3 8h10M9 4l4 4-4 4'
	};

	interface Props {
		name: keyof typeof paths;
		size?: number;
		stroke?: number;
	}

	let { name, size = 16, stroke = 1.3 }: Props = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 16 16"
	fill="none"
	stroke="currentColor"
	stroke-width={stroke}
	aria-hidden="true"
>
	<path d={paths[name]} />
</svg>

<style lang="scss">
	svg {
		flex: none;
	}
</style>
