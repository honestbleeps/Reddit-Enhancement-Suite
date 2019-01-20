/* @flow */

// Due to brower's blocking of embedded pages, the settings console might fail to display
// Detect this early, so settingsNavigation can create a new tab instead
if (window !== window.top) {
	let blocked = true; // Use a variable to avoid this becoming optimized out
	try {
		// Storage is necessary for RES
		blocked = !Number.isInteger(localStorage.length + sessionStorage.length);
	} catch (e) {
		if (blocked) {
			window.parent.postMessage({ failedToLoad: true }, '*');
			window.stop();
		}
	}
}
