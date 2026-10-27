/* @flow */

import { Module } from '../core/module';
import { getOldRedditUrl } from './oldRedditRedirectUtils';

export const module: Module<*> = new Module('oldRedditRedirect');

module.moduleName = 'oldRedditRedirectName';
module.category = 'browsingCategory';
module.description = 'oldRedditRedirectDesc';
module.keywords = ['old reddit', 'legacy', 'redirect'];
module.disabledByDefault = true;

module.beforeLoad = () => {
	const redirectUrl = getOldRedditUrl(location.href);
	if (redirectUrl) window.location.replace(redirectUrl);
};
