/* @flow */

export const HLS_PLAYLIST_TYPE = 'application/vnd.apple.mpegurl';
export const DASH_PLAYLIST_TYPE = 'application/dash+xml';

export function getVredditPlaylistUrls(id: string): {|
	dash: string,
	hls: string,
|} {
	return {
		dash: `https://v.redd.it/${id}/DASHPlaylist.mpd`,
		hls: `https://v.redd.it/${id}/HLSPlaylist.m3u8`,
	};
}

export function buildVredditVideoSources({
	buildTarget = process.env.BUILD_TARGET,
	dashManifest,
	hasAudio,
	hlsAvailable = false,
	id,
	mp4Sources,
}: {|
	buildTarget?: string,
	dashManifest: string,
	hasAudio: boolean,
	hlsAvailable?: boolean,
	id: string,
	mp4Sources: string[],
|}): {|
	muted: boolean,
	sources: Array<{|
		source: string,
		type: string,
	|}>,
	transport: 'mp4' | 'hls' | 'dash',
|} {
	if (buildTarget === 'safari' && hasAudio && hlsAvailable) {
		return {
			muted: false,
			sources: [{ source: getVredditPlaylistUrls(id).hls, type: HLS_PLAYLIST_TYPE }],
			transport: 'hls',
		};
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
