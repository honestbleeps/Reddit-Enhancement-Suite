/* @noflow */

/* eslint-env webextensions */

// Tell the background page that the auth flow has completed.
// We use the background page to close this tab to get around Edge's
// ridiculous "The site you're on is trying to close this window." warning.
browser.runtime.sendMessage({ type: 'authFlowComplete' });
