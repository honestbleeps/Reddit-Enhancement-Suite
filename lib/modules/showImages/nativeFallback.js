/* @flow */

export function shouldPreferNativeExpando(siteModuleID: string, hasNativeExpando: boolean, buildTarget: string = process.env.BUILD_TARGET): boolean {
	return buildTarget === 'safari' &&
		hasNativeExpando &&
		siteModuleID === 'vreddit';
}
