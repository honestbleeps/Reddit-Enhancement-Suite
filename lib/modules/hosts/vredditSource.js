/* @flow */

export const HLS_PLAYLIST_TYPE = 'application/vnd.apple.mpegurl';
export const DASH_PLAYLIST_TYPE = 'application/dash+xml';

type VideoSource = {|
	source: string,
	reverse?: string,
	type: string,
|};

type BuiltVideoSources = {|
	muted: boolean,
	sources: Array<VideoSource>,
	transport: 'mp4' | 'hls' | 'dash',
|};

export function getVredditPlaylistUrls(id: string): {|
	dash: string,
	hls: string,
|} {
	return {
		dash: `https://v.redd.it/${id}/DASHPlaylist.mpd`,
		hls: `https://v.redd.it/${id}/HLSPlaylist.m3u8`,
	};
}

export function buildSafariHlsVideoSources(hlsPlaylistUrl: string): BuiltVideoSources {
	return {
		muted: false,
		sources: [{ source: hlsPlaylistUrl, type: HLS_PLAYLIST_TYPE }],
		transport: 'hls',
	};
}

export function buildVredditVideoSources({
	buildTarget,
	dashManifest,
	hasAudio,
	hlsAvailable = false,
	id,
	mp4Sources,
}: {|
	buildTarget?: ?string,
	dashManifest: string,
	hasAudio: boolean,
	hlsAvailable?: boolean,
	id: string,
	mp4Sources: string[],
|}): BuiltVideoSources {
	const resolvedBuildTarget = typeof buildTarget === 'string' ? buildTarget : process.env.BUILD_TARGET;

	if (resolvedBuildTarget === 'safari' && hasAudio && hlsAvailable) {
		return buildSafariHlsVideoSources(getVredditPlaylistUrls(id).hls);
	}

	if (!hasAudio) {
		return {
			muted: true,
			sources: mp4Sources.map(source => ({ source, type: 'video/mp4' })),
			transport: 'mp4',
		};
	}

	return {
		muted: false,
		sources: [{ source: dashManifest, type: DASH_PLAYLIST_TYPE }],
		transport: 'dash',
	};
}
