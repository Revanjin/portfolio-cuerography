interface Elements {
	// nimmt die Gesten an, auch neben dem Foto
	stage: HTMLElement;
	// Rahmen des Fotos, wandert beim Wischen mit
	frame: HTMLElement;
	// Inhalt des Rahmens, wird beim Zoom skaliert und verschoben
	canvas: HTMLElement;
}

interface Handlers {
	onTurn: (direction: 1 | -1) => void;
	onDismiss: () => void;
	onZoom: (scale: number) => void;
}

const MAX_SCALE = 4;
const TAP_SCALE = 2;
const DRAG_START = 8;
const COMMIT_DISTANCE = 96;
const DOUBLE_TAP_MS = 300;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function attachGestures({ stage, frame, canvas }: Elements, handlers: Handlers) {
	const pointers = new Map<number, { x: number; y: number }>();
	let scale = 1;
	let x = 0;
	let y = 0;
	let startX = 0;
	let startY = 0;
	let hasMoved = false;
	let drag: 'turn' | 'dismiss' | null = null;
	let pinchDistance = 0;
	let pinchScale = 1;
	let lastTap = 0;

	function render(isAnimated: boolean) {
		canvas.style.transition = isAnimated ? '' : 'none';
		canvas.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
	}

	function keepInside(rect: DOMRect) {
		x = clamp(x, rect.width * (1 - scale), 0);
		y = clamp(y, rect.height * (1 - scale), 0);
	}

	// Der Punkt unter dem Finger bleibt beim Zoomen an seiner Stelle.
	function zoomTo(nextScale: number, clientX: number, clientY: number, isAnimated: boolean) {
		const rect = frame.getBoundingClientRect();
		const pointX = clamp(clientX - rect.left, 0, rect.width);
		const pointY = clamp(clientY - rect.top, 0, rect.height);
		const next = clamp(nextScale, 1, MAX_SCALE);

		x = pointX - ((pointX - x) / scale) * next;
		y = pointY - ((pointY - y) / scale) * next;
		scale = next;
		keepInside(rect);
		render(isAnimated);
		handlers.onZoom(scale);
	}

	function toggleZoom(clientX: number, clientY: number) {
		zoomTo(scale > 1 ? 1 : TAP_SCALE, clientX, clientY, true);
	}

	function isOnPhoto(clientX: number, clientY: number) {
		const rect = frame.getBoundingClientRect();
		return (
			clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
		);
	}

	function moveFrame(offsetX: number, offsetY: number) {
		frame.style.transition = 'none';
		frame.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
		frame.style.opacity = String(1 - Math.min(offsetY / 400, 0.6));
	}

	function releaseFrame() {
		frame.style.transition = '';
		frame.style.transform = '';
		frame.style.opacity = '';
	}

	function pinchState() {
		const [a, b] = [...pointers.values()];
		return {
			distance: Math.hypot(a.x - b.x, a.y - b.y),
			centerX: (a.x + b.x) / 2,
			centerY: (a.y + b.y) / 2
		};
	}

	function onPointerDown(event: PointerEvent) {
		if (event.pointerType === 'mouse' && event.button !== 0) return;

		stage.setPointerCapture(event.pointerId);
		pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

		if (pointers.size === 2) {
			pinchDistance = pinchState().distance;
			pinchScale = scale;
			hasMoved = true;
			drag = null;
			releaseFrame();
			return;
		}

		startX = event.clientX;
		startY = event.clientY;
		hasMoved = false;
		drag = null;
	}

	function onPointerMove(event: PointerEvent) {
		const previous = pointers.get(event.pointerId);
		if (!previous) return;
		pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

		if (pointers.size === 2) {
			const { distance, centerX, centerY } = pinchState();
			zoomTo(pinchScale * (distance / pinchDistance), centerX, centerY, false);
			return;
		}

		const dx = event.clientX - startX;
		const dy = event.clientY - startY;
		if (!hasMoved && Math.hypot(dx, dy) < DRAG_START) return;
		hasMoved = true;

		// Gezoomt verschiebt Ziehen den Ausschnitt, Blättern und Schließen sind dann aus.
		if (scale > 1) {
			x += event.clientX - previous.x;
			y += event.clientY - previous.y;
			keepInside(frame.getBoundingClientRect());
			render(false);
			return;
		}

		if (!drag) {
			if (Math.abs(dx) > Math.abs(dy)) drag = 'turn';
			else if (dy > 0) drag = 'dismiss';
		}
		if (drag === 'turn') moveFrame(dx, 0);
		if (drag === 'dismiss') moveFrame(0, Math.max(dy, 0));
	}

	function onPointerUp(event: PointerEvent) {
		if (!pointers.delete(event.pointerId)) return;

		// Nach dem Pinch bleibt ein Finger liegen: von dort aus weiter verschieben.
		if (pointers.size === 1) {
			const [rest] = [...pointers.values()];
			startX = rest.x;
			startY = rest.y;
			return;
		}

		const dx = event.clientX - startX;
		const dy = event.clientY - startY;
		const finished = drag;
		drag = null;
		releaseFrame();

		if (event.type === 'pointercancel') return;

		if (finished === 'turn' && Math.abs(dx) > Math.min(COMMIT_DISTANCE, stage.clientWidth / 4)) {
			handlers.onTurn(dx < 0 ? 1 : -1);
		} else if (finished === 'dismiss' && dy > COMMIT_DISTANCE) {
			handlers.onDismiss();
		} else if (!hasMoved && isOnPhoto(event.clientX, event.clientY)) {
			onTap(event);
		}
	}

	// Maus: ein Klick zoomt. Finger: erst der zweite Tipp, sonst zoomt jedes Antippen.
	function onTap(event: PointerEvent) {
		if (event.pointerType === 'mouse') {
			toggleZoom(event.clientX, event.clientY);
			return;
		}
		if (event.timeStamp - lastTap < DOUBLE_TAP_MS) {
			lastTap = 0;
			toggleZoom(event.clientX, event.clientY);
		} else {
			lastTap = event.timeStamp;
		}
	}

	// Tastatur: Enter oder Leertaste auf dem Foto. Zeigerklicks haben detail > 0 und laufen über onTap.
	function onClick(event: MouseEvent) {
		if (event.detail !== 0) return;
		const rect = frame.getBoundingClientRect();
		toggleZoom(rect.left + rect.width / 2, rect.top + rect.height / 2);
	}

	// Trackpad-Pinch kommt in Chrome und Firefox als Mausrad mit gedrückter Strg-Taste an.
	function onWheel(event: WheelEvent) {
		if (event.ctrlKey) {
			event.preventDefault();
			zoomTo(scale * Math.exp(-event.deltaY / 100), event.clientX, event.clientY, false);
		} else if (scale > 1) {
			event.preventDefault();
			x -= event.deltaX;
			y -= event.deltaY;
			keepInside(frame.getBoundingClientRect());
			render(false);
		}
	}

	// Safari am Mac meldet den Trackpad-Pinch nur über seine eigenen Gesture-Events.
	// Auf dem iPhone feuern sie zusätzlich zu den Pointer Events, deshalb dort überspringen.
	function onGestureStart(event: Event) {
		event.preventDefault();
		pinchScale = scale;
	}

	function onGestureChange(event: Event) {
		event.preventDefault();
		if (pointers.size > 0) return;
		const gesture = event as Event & { scale: number; clientX: number; clientY: number };
		zoomTo(pinchScale * gesture.scale, gesture.clientX, gesture.clientY, false);
	}

	stage.addEventListener('pointerdown', onPointerDown);
	stage.addEventListener('pointermove', onPointerMove);
	stage.addEventListener('pointerup', onPointerUp);
	stage.addEventListener('pointercancel', onPointerUp);
	stage.addEventListener('wheel', onWheel, { passive: false });
	stage.addEventListener('gesturestart', onGestureStart);
	stage.addEventListener('gesturechange', onGestureChange);
	frame.addEventListener('click', onClick);

	return {
		reset() {
			scale = 1;
			x = 0;
			y = 0;
			render(false);
		},
		destroy() {
			stage.removeEventListener('pointerdown', onPointerDown);
			stage.removeEventListener('pointermove', onPointerMove);
			stage.removeEventListener('pointerup', onPointerUp);
			stage.removeEventListener('pointercancel', onPointerUp);
			stage.removeEventListener('wheel', onWheel);
			stage.removeEventListener('gesturestart', onGestureStart);
			stage.removeEventListener('gesturechange', onGestureChange);
			frame.removeEventListener('click', onClick);
		}
	};
}
