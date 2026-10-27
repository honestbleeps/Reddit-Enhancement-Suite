/* @flow */

import type { Host } from '../../core/host';

export function getNativeExpandoOptions(siteModule: Host<*, *>, nativeOpen: boolean): {| replace: boolean, expand: boolean |} {
	const isImage = ['redditgallery', 'ireddit', 'defaultImage'].includes(siteModule.moduleID);
	const forceReplace = siteModule.options && siteModule.options.forceReplaceNativeExpando;
	return {
		replace: !nativeOpen || isImage || !!(forceReplace && forceReplace.value),
		expand: nativeOpen && isImage,
	};
}
