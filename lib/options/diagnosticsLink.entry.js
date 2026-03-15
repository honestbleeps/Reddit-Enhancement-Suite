/* @flow */

const link = document.getElementById('diagnostics-link');
const runtime = window.chrome && window.chrome.runtime;

if (link instanceof HTMLAnchorElement && runtime && runtime.getURL) {
	link.href = runtime.getURL('debug.html');
}
