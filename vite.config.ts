import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter(),
			preprocess: vitePreprocess(),
			// CSS landet im HTML: ein Request weniger im Instagram-In-App-Browser
			inlineStyleThreshold: 40_000,
			version: { pollInterval: 0 }
		})
	]
});
