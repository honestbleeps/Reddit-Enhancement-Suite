/* @flow */

export function canFallbackToNativeOnInitFailure(siteModuleID: string, hasNativeExpando: boolean, buildTarget: ?string = process.env.BUILD_TARGET): boolean {
	return buildTarget === 'safari' &&
		hasNativeExpando &&
		siteModuleID === 'vreddit';
}

export function canFallbackToNativeOnMediaFailure(mediaType: string, hasNativeExpando: boolean, buildTarget: ?string = process.env.BUILD_TARGET): boolean {
	return buildTarget === 'safari' &&
		hasNativeExpando &&
		mediaType === 'VIDEO';
}

export function restoreNativeExpando({
	expando,
	nativeExpando,
	cleanup,
}: {|
	expando: {| destroy: () => void, open?: boolean, expandWanted?: boolean |},
	nativeExpando: { reattach: () => void, expand: () => void, open?: boolean },
	cleanup?: () => void,
|}): boolean {
	if (!nativeExpando) return false;

	const shouldExpand = Boolean(expando && (expando.open || expando.expandWanted));

	expando.destroy();
	if (cleanup) cleanup();
	nativeExpando.reattach();

	if (shouldExpand && !nativeExpando.open) nativeExpando.expand();

	return true;
}
