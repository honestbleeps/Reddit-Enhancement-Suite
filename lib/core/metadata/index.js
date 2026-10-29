/* @flow */

import { downcast } from '../../utils/flow';

const announcementsSubreddit: string = downcast(process.env.announcementsSubreddit, 'string');
const name: string = downcast(process.env.name, 'string');
const version: string = downcast(process.env.version, 'string');
const isBeta: boolean = Boolean(downcast(process.env.isBeta, 'string'));
const isPatch: boolean = Boolean(downcast(process.env.isPatch, 'string'));
const isMinor: boolean = Boolean(downcast(process.env.isMinor, 'string'));
const isMajor: boolean = Boolean(downcast(process.env.isMajor, 'string'));
const updatedURL: string = downcast(process.env.updatedURL, 'string');
const homepageURL: string = downcast(process.env.homepageURL, 'string');

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
