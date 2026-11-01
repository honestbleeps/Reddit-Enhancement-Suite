/* @flow */

import { downcast } from '../../utils/flow';

const announcementsSubreddit: string = downcast(process.env.announcementsSubreddit, 'string');
const name: string = downcast(process.env.name, 'string');
const version: string = downcast(process.env.version, 'string');
const isBeta: boolean = downcast(process.env.isBeta, 'string') === 'true';
const isPatch: boolean = downcast(process.env.isPatch, 'string') === 'true';
const isMinor: boolean = downcast(process.env.isMinor, 'string') === 'true';
const isMajor: boolean = downcast(process.env.isMajor, 'string') === 'true';
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
