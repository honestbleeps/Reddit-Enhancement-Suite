/* @flow */

import { downcast } from '../../utils/flow';

const announcementsSubreddit = downcast(process.env.announcementsSubreddit, 'string');
const name = downcast(process.env.name, 'string');
const version = downcast(process.env.version, 'string');
const isBeta = Boolean(downcast(process.env.isBeta, 'string'));
const isPatch = Boolean(downcast(process.env.isPatch, 'string'));
const isMinor = Boolean(downcast(process.env.isMinor, 'string'));
const isMajor = Boolean(downcast(process.env.isMajor, 'string'));
const updatedURL = downcast(process.env.updatedURL, 'string');
const homepageURL = downcast(process.env.homepageURL, 'string');

export {
	announcementsSubreddit,
	name,
	version,
	isBeta,
	isPatch,
	isMinor,
	isMajor,
	updatedURL,
	homepageURL,
};
