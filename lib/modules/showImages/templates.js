/* @flow */

import { i18n } from '../../environment';
import { string } from '../../utils';

export const audioTemplate = ({ loop, sources }: {| loop?: boolean, sources: Array<{| file: string, type: string |}> |}) => string.html`
	<div>
		<audio controls ${loop && 'loop'}>
			${sources.map(({ file, type }) => string._html`
				<source src="${file}" type="${type}">
			`)}
		</audio>
	</div>
`;

export const galleryTemplate = <T>({ title, caption, credits, src }: {| title?: string, caption?: string, credits?: string, src: T[] |}) => string.html`
	<div class="res-gallery">
		${title && string._html`
		<h3 class="res-title res-gallery-title">${title}</h3>
		`}
		${caption && string._html`
		<div class="res-caption res-gallery-caption">${string.safe(caption)}</div>
		`}
		${credits && string._html`
		<div class="res-credits">${string.safe(credits)}</div>
		`}
		<div class="res-step-container">
			<div class="res-step res-step-previous" role="button"></div>
			<div class="res-step-progress">
				<span class="res-step-position">1</span> of ${src.length}
			</div>
			<div class="res-step res-step-next" role="button"></div>
			<div class="res-gallery-to-filmstrip" title="View as filmstrip" role="button"></div>
		</div>
		<div class="res-gallery-pieces"></div>
		<div class="res-gallery-below">
			<div>
				<div class="res-expando-siteAttribution"></div>
				<div class="res-gallery-increase-concurrent"></div>
			</div>
		</div>
	</div>
`;

export const imageTemplate = ({ title, caption, credits, src, href, openInNewWindow }: {| title?: string, caption?: string, credits?: string, src: string, href: string, openInNewWindow: boolean |}) => string.html`
	<div class="res-image">
		${title && string._html`
		<h4 class="res-title">${title}</h4>
		`}
		${caption && string._html`
		<div class="res-caption">${string.safe(caption)}</div>
		`}
		${credits && string._html`
		<div class="res-credits">${string.safe(credits)}</div>
		`}
		<a class="res-expando-link noKeyNav" href="${href}" ${openInNewWindow && string._html`target="_blank" rel="noopener noreferrer"`}>
			<img class="res-image-media" src="${src}">
		</a>
	</div>
`;

export const iframeTemplate = ({ url, width, height }: {| url: string, width: string, height: string |}) => string.html`
	<div class="res-iframe-expando">
		<div>
			<iframe src="${url}" style="width: ${width}; height: ${height}" allowFullscreen="true"></iframe>
			<div class="res-iframe-expando-drag-handle">
				<div class="res-icon"></div>
				<div class="res-expando-siteAttribution"></div>
			</div>
		</div>
	</div>
`;

export const textTemplate = ({ title, credits, src }: {| title?: string, credits?: string, src: string |}) => string.html`
	<div class="res-text usertext-body">
		${title && string._html`
		<h3 class="res-title">${title}</h3>
		`}
		<div class="res-text-media md">${string.safe(src)}</div>
		${credits && string._html`
		<div class="res-credits">${string.safe(credits)}</div>
		`}
	</div>
`;

export const videoTemplate = ({
	title,
	caption,
	credits,
	source,
	poster,
	hasAudio,
	loop,
	reversable,
	formattedPlaybackRate,
}: {|
	title?: string,
	caption?: string,
	credits?: string,
	source: string,
	poster?: string,
	hasAudio: boolean,
	loop: boolean,
	reversable: boolean,
	formattedPlaybackRate: string,
|}) => string.html`
	<div class="res-video">
		${title && string._html`
		<h4 class="res-title">${title}</h4>
		`}
		${caption && string._html`
		<div class="res-caption">${string.safe(caption)}</div>
		`}
		${credits && string._html`
		<div class="res-credits">${string.safe(credits)}</div>
		`}
		<div class="res-video-container">
			<video preload="auto" ${!hasAudio && 'muted'} ${loop && 'loop'} poster="${poster}"></video>
			<div hidden class="res-video-error"></div>
			<div class="res-video-interface">
				<div class="res-video-progress">
					<div class="res-video-position"></div>
					<div class="res-video-position-thumb"></div>
				</div>
				<div class="res-video-main">
					<div class="res-video-controls" hidden>
						<div title="Toggle pause" class="res-icon res-video-button res-video-toggle-pause"></div>
						${reversable && string._html`
						<div title="Reverse video" class="res-icon res-video-button res-video-reverse"></div>
						`}
						${hasAudio && string._html`
							<div title="Adjust volume" class="res-icon res-video-button res-video-volume">
								<div class="res-video-volume-level">
									<div class="res-video-volume-percentage"></div>
								</div>
							</div>
						`}
						<div class="res-video-controls-group res-video-current-time">
							<div title="Select previous frame" class="res-icon res-video-button res-video-time-decrease"></div>
							<div class="res-video-time">0.00s</div>
							<div title="Select next frame" class="res-icon res-video-button res-video-time-increase"></div>
						</div>
						<div class="res-video-controls-group res-video-playback-rate">
							<div title="Decrease speed by 10%" class="res-icon res-video-button res-video-speed-decrease"></div>
							<div class="res-video-speed">${string.safe(formattedPlaybackRate)}</div>
							<div title="Increase speed by 10%" class="res-icon res-video-button res-video-speed-increase"></div>
						</div>
					</div>
					<div class="res-video-info">
						<a class="res-video-link res-video-source" href="${source}" rel="noopener noreferrer">source</a>
						<div class="res-expando-siteAttribution"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
`;

export const mediaControlsTemplate = ({ x, y, downloadUrl, lookupUrl, clippy }: {| x: string, y: string, downloadUrl?: string, lookupUrl?: string, clippy: boolean |}) => string.html`
	<div class="res-media-with-controls-wrapper">
		<div class="res-media-controls res-media-controls-${x} res-media-controls-${y}">
			<button class="res-icon gearIcon" title="Settings" data-action="showImageSettings"></button>
			<button class="res-media-controls-rotate res-media-controls-rotate-left res-icon" title="Rotate image counter-clockwise" data-action="rotateLeft"></button>
			<button class="res-media-controls-rotate res-media-controls-rotate-right res-icon" title="Rotate image clockwise" data-action="rotateRight"></button>
			${downloadUrl && string._html`
			<button class="res-media-controls-download res-icon title="Download image" data-action="download"></button>
			`}
			${lookupUrl && string._html`
			<button class="res-media-controls-lookup res-icon" title="Reverse image search" data-action="imageLookup"></button>
			`}
			${clippy && string._html`
			<button class="res-media-controls-clippy" title="Show educational info" data-action="clippy"></button>
			`}
		</div>
	</div>
`;

export const siteAttributionTemplate = ({ url, name, logoUrl, settingsLink }: {| url: string, name: string, logoUrl?: string, settingsLink: string |}) => string.html`
	<cite class="res-expando-siteAttribution">
		<a href="${url}" target="_blank" rel="noopener noreferer">
			${logoUrl && string._html`<img src="${logoUrl}" alt="Hosted on ${name}" title="Hosted on ${name}" />`}
			<span>hosted on ${name}</span>
			<a href="${settingsLink}" class="gearIcon" title="Disable or change settings for ${name}"></a>
		</a>
	</cite>
`;

export const crosspostMetadataTemplate = (data: {
	url: string,
	crosspostRootSubreddit: string,
	crosspostRootAuthor: string,
	crosspostRootScore: string,
	crosspostRootNumComments: string,
	crosspostRootTime: string,
	crosspostRootTitle: string,
	targetParentFullname: string,
}) => string.html`
	<div class="crosspost-preview res-crosspost-preview">
		<div class="crosspost-preview-header">
			<a href="${data.url}" class="content-link may-blank" data-event-action="title" tabindex="1"></a>
			<div class="text-content">
				<p class="title">${data.crosspostRootTitle}</p>
				<div class="crosspost-preview-tagline tagline">
					<span>${i18n('numPoints', parseInt(data.crosspostRootScore, 10))}</span>
					<span class="dot">•</span>
					<a href="/r/${data.crosspostRootSubreddit}/comments/${(data.targetParentFullname || '').slice(3)}" class="comments may-blank">${i18n('numComments', parseInt(data.crosspostRootNumComments, 10))}</a>
					<span class="dot">•</span>
					${i18n('submittedAtTime')} <time>${data.crosspostRootTime}</time>
					${i18n('submittedByAuthor')} <a href="/user/${data.crosspostRootAuthor}/" class="author may-blank">${data.crosspostRootAuthor}</a>
					${i18n('submittedToSubreddit')} <a href="/r/${data.crosspostRootSubreddit}/" class="subreddit hover may-blank">r/${data.crosspostRootSubreddit}</a>
				</div>
			</div>
		</div>
	</div>
`;
