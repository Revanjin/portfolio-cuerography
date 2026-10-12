declare global {
	// Network Information API: nur Chromium, deshalb nicht in lib.dom
	interface NetworkInformation {
		readonly saveData?: boolean;
		readonly downlink?: number;
		readonly effectiveType?: string;
	}

	interface Navigator {
		readonly connection?: NetworkInformation;
	}

	interface ImportMetaEnv {
		readonly VITE_WEB3FORMS_KEY?: string;
	}

	interface HTMLVideoElement {
		webkitEnterFullscreen?(): void;
	}
}

export {};
