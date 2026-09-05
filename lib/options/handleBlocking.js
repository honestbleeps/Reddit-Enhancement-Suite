/* @flow */

// The browser may block localStorage etc on embedded pages, preventing the settings console from rendering
// Detect this early, so that settingsNavigation can open it in a new tab instead
export function ensureStorageAvailable() {
	if (window === window.top) return;

	let blocked = true;
	try {
		// Storage is necessary for RES
		blocked = !Number.isInteger(localStorage.length + sessionStorage.length);
	} catch (e) {
		blocked = true;
	}

	if (!blocked) return;

	window.parent.postMessage({ failedToLoad: true }, '*');
	throw new Error('Storage is not available');
}
