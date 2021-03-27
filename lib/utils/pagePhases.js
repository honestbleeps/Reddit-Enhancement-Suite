/* @flow */

import { waitFor } from './async';
import { waitForChild, waitForEvent, waitForDescendant } from './dom';

export const bodyStart: Promise<*> = waitForChild(document.documentElement, 'body')
	// `document.body === null` at this point has been reported for users of Firefox and Chrome,
	// so wait till the reference has been updated before progressing
	.then(() => waitFor(() => document.body, 10));

export const contentStart: Promise<*> = bodyStart
	.then(() => Promise.race([
		bodyStart.then(() => waitForDescendant(document.body, '#siteTable')),
		contentLoaded,
	]));

export const contentLoaded: Promise<*> = bodyStart
	.then(() => Promise.race([
		waitForEvent(window, 'DOMContentLoaded', 'load'),
		waitFor(() => document.readyState === 'interactive' || document.readyState === 'complete', 500),
	]));

export const loadComplete: Promise<*> = bodyStart
	.then(() => Promise.race([
		waitForEvent(window, 'load'),
		waitFor(() => document.readyState === 'complete', 500),
	]));

