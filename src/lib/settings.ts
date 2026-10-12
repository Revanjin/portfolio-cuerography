interface Settings {
	gallery: 'masonry' | 'slider';
	columnsDesktop: 3 | 2;
	captions: boolean;
	video: {
		mode: 'two' | 'one';
		offline: boolean;
	};
	name: string;
	city: string;
	instagramHandle: string;
	email: string;
	videoTitle: string;
	videoYear: string;
}

// Zum Umschalten jeweils die aktive Zeile mit der auskommentierten darunter tauschen.
export const settings: Settings = {
	gallery: 'masonry',
	// gallery: 'slider',

	// nur Masonry; Smartphone und iPad hoch zeigen immer 2 Spalten
	columnsDesktop: 3,
	// columnsDesktop: 2,

	captions: true,
	// captions: false,

	video: {
		// 'two': Handy bekommt eine eigene 4:5-Datei, 'one': eine 16:9-Datei für alle
		mode: 'two',
		// mode: 'one',

		// true speichert die Handy-Datei im Service Worker
		offline: false
		// offline: true
	},

	name: 'Cyrill Kraehenbuehl',
	city: '[City]',
	instagramHandle: 'cyrill_kraehenbuehl',
	email: 'hello@cyrillkraehenbuehl.com',
	videoTitle: '[Video title]',
	videoYear: '[Year]'
};

export const instagramUrl = `https://www.instagram.com/${settings.instagramHandle}`;

// Im HTML steht die Adresse nur in dieser Schreibweise, damit Adresssammler sie nicht finden.
// Die echte Adresse kommt erst beim Klick ins Spiel.
export const emailLabel = settings.email.replace('@', '(at)').replace(/\.(?=[^.]+$)/, '(dot)');
