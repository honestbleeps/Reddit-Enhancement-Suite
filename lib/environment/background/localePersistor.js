/* @flow */

import { addListener } from './messaging';

let lastRedditLocale = navigator.language || 'en';

addListener('getLastRedditLocale', () => lastRedditLocale);
addListener('setLastRedditLocale', v => { lastRedditLocale = v; });
