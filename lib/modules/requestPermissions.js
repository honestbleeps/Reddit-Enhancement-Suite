/* @flow */

import { Module } from '../core/module';

export const module: Module<*> = new Module('requestPermissions');

module.moduleName = 'requestPermissionsName';
module.description = 'requestPermissionsDesc';
module.category = 'aboutCategory';
module.disabledByDefault = true;
module.permissions = {
	// TODO Find some way to keep in sync with manifests
	requiredPermissions: process.env.BUILD_TARGET === 'firefox' ? [
		'downloads',

		'https://api.twitter.com/*',
		'https://backend.deviantart.com/oembed',
		'https://api.gyazo.com/api/oembed',
		'https://codepen.io/api/oembed',
		'https://api.tumblr.com/v2/blog/*/posts',
		'https://xkcd.com/*/info.0.json',
		'https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/*',
		'https://*.googleusercontent.com/download/drive/v3/*',
		'https://content.googleapis.com/drive/v3/*',
	] : [
		'downloads',

		'https://api.twitter.com/*',
		'https://backend.deviantart.com/oembed',
		'https://api.gyazo.com/api/oembed',
		'https://codepen.io/api/oembed',
		'https://api.tumblr.com/v2/blog/*/posts',
		'https://xkcd.com/*/info.0.json',
		'https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/*',
		'https://*.googleusercontent.com/download/drive/v3/*',
		'https://content.googleapis.com/drive/v3/*',

		'https://redditenhancementsuite.com/oauth',
		'https://accounts.google.com/o/oauth2/v2/auth',
		'https://www.dropbox.com/oauth2/authorize',
		'https://login.live.com/oauth20_authorize.srf',
	],
	message: 'This will open a prompt for all remaining optional permissionss',
};
