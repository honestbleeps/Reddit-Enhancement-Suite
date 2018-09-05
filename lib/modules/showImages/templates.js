/* @flow */

import html from 'nanohtml';
import { i18n } from '../../environment';

export const audioTemplate = ({ loop, sources }: {| loop?: boolean, sources: Array<{| file: string, type: string |}> |}) => html`
	<div>
		<audio controls loop="${loop}">
			${sources.map(({ file, type }) => html`
				<source src="${file}" type="${type}">
			`)}
		</audio>
	</div>
`;

export const galleryTemplate = <T>({ title, caption, credits, src }: {| title?: string, caption?: string, credits?: string, src: T[] |}) => html`
	<div class="res-gallery">
		${title ? html`
		<h3 class="res-title res-gallery-title">${title}</h3>
		` : null}
		${caption ? html`
		<div class="res-caption res-gallery-caption">${caption}</div>
		` : null}
		${credits ? html`
		<div class="res-credits">${credits}</div>
		` : null}
		<div class="res-gallery-individual-controls">
			<div class="res-step res-gallery-previous"></div>
			<div class="res-step-progress">
				<span class="res-gallery-position">1</span> of ${src.length}
			</div>
			<div class="res-step res-step-reverse res-gallery-next"></div>
			<div class="res-gallery-to-filmstrip" title="View as filmstrip"></div>
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

export const imageTemplate = ({ title, caption, credits, src, href, openInNewWindow }: {| title?: string, caption?: string, credits?: string, src: string, href: string, openInNewWindow: boolean |}) => html`
	<div class="res-image">
		${title ? html`
		<h4 class="res-title">${title}</h4>
		` : null}
		${caption ? html`
		<div class="res-caption">${caption}</div>
		` : null}
		${credits ? html`
		<div class="res-credits">${credits}</div>
		` : null}
		<a class="res-expando-link noKeyNav" href="${href}" target="${openInNewWindow ? '_blank' : ''}" rel="noopener noreferrer">
			<img class="res-image-media" src="${src}">
		</a>
	</div>
`;

export const iframeTemplate = ({ url, width, height }: {| url: string, width: string, height: string |}) => html`
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

export const textTemplate = ({ title, credits, src }: {| title?: string, credits?: string, src: string |}) => html`
	<div class="res-text usertext-body">
		${title ? html`
		<h3 class="res-title">${title}</h3>
		` : null}
		<div class="res-text-media md">${src}</div>
		${credits ? html`
		<div class="res-credits">${credits}</div>
		` : null}
	</div>
`;

export const videoAdvancedTemplate = ({
	title,
	caption,
	credits,
	href,
	source,
	poster,
	muted,
	loop,
	reversable,
	controls,
	advancedControls,
	formattedPlaybackRate,
	openInNewWindow,
}: {|
	title?: string,
	caption?: string,
	credits?: string,
	href: string,
	source?: string,
	poster?: string,
	muted: boolean,
	loop: boolean,
	reversable: boolean,
	controls: boolean,
	advancedControls: boolean,
	formattedPlaybackRate: string,
	openInNewWindow: boolean,
|}) => html`
	<div class="video-advanced">
		${title ? html`
		<h4 class="res-title">${title}</h4>
		` : null}
		${caption ? html`
		<div class="res-caption">${caption}</div>
		` : null}
		${credits ? html`
		<div class="res-credits">${credits}</div>
		` : null}
		<div class="video-advanced-container">
			${controls ? html`
			<video controls muted="${muted}" loop="${loop}" poster="${poster}"></video>
			` : html`
			<a class="noKeyNav" href="${href}" target="${openInNewWindow ? '_blank' : ''}" rel="noopener noreferrer">
				<video muted="${muted}" loop="${loop}" poster="${poster}"></video>
			</a>
			`}
			${advancedControls ? html`
			<div class="video-advanced-interface">
				<div class="video-advanced-progress">
					<div class="video-advanced-position"></div>
					<div class="video-advanced-position-thumb"></div>
				</div>
				<div class="video-advanced-main">
					<div class="video-advanced-controls">
						<div title="Toggle pause" class="res-icon video-advanced-button video-advanced-toggle-pause"></div>
						${reversable ? html`
						<div title="Reverse video" class="res-icon video-advanced-button video-advanced-reverse"></div>
						` : null}
						${muted ? null : html`
							<div title="Adjust volume" class="res-icon video-advanced-button video-advanced-volume">
								<div class="video-advanced-volume-level">
									<div class="video-advanced-volume-percentage"></div>
								</div>
							</div>
						`}
						<div class="video-advanced-controls-group video-advanced-current-time">
							<div title="Select previous frame" class="res-icon video-advanced-button video-advanced-time-decrease"></div>
							<div class="video-advanced-time">1.00s</div>
							<div title="Select next frame" class="res-icon video-advanced-button video-advanced-time-increase"></div>
						</div>
						<div class="video-advanced-controls-group video-advanced-playback-rate">
							<div title="Decrease speed by 10%" class="res-icon video-advanced-button video-advanced-speed-decrease"></div>
							<div class="video-advanced-speed">${formattedPlaybackRate}</div>
							<div title="Increase speed by 10%" class="res-icon video-advanced-button video-advanced-speed-increase"></div>
						</div>
					</div>
					<div hidden class="video-advanced-error">
						<div class="res-icon">&#xf15b</div>
					</div>
					<div class="video-advanced-info">
						${source ? html`
						<a class="video-advanced-link video-advanced-source" href="${source}">source</a>
						` : null}
						<div class="res-expando-siteAttribution"></div>
					</div>
				</div>
			</div>
			` : html`
			<div hidden class="video-advanced-error">
				<div class="res-icon">&#xf15b</div>
			</div>
			`}
		</div>
	</div>
`;

export const mediaControlsTemplate = ({ x, y, downloadUrl, lookupUrl, clippy }: {| x: string, y: string, downloadUrl?: string, lookupUrl?: string, clippy: boolean |}) => html`
	<div class="res-media-with-controls-wrapper">
		<div class="res-media-controls res-media-controls-${x} res-media-controls-${y}">
			<button class="res-icon gearIcon" title="Settings" data-action="showImageSettings"></button>
			<button class="res-media-controls-rotate res-media-controls-rotate-left res-icon" title="Rotate image counter-clockwise" data-action="rotateLeft"></button>
			<button class="res-media-controls-rotate res-media-controls-rotate-right res-icon" title="Rotate image clockwise" data-action="rotateRight"></button>
			${downloadUrl ? html`
			<button class="res-media-controls-download res-icon" title="Download image" data-action="download"></button>
			` : null}
			${lookupUrl ? html`
			<button class="res-media-controls-lookup res-icon" title="Reverse image search" data-action="imageLookup"></button>
			` : null}
			${clippy ? html`
			<button class="res-media-controls-clippy" title="Show educational info" data-action="clippy"></button>
			` : null}
		</div>
	</div>
`;

export const siteAttributionTemplate = ({ url, name, logoUrl, settingsLink }: {| url: string, name: string, logoUrl?: string, settingsLink: string |}) => html`
	<cite class="res-expando-siteAttribution">
		<a href="${url}" target="_blank" rel="noopener noreferer">
			${logoUrl ? html`<img src="${logoUrl}" alt="Hosted on ${name}" title="Hosted on ${name}" />` : null}
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
}) => html`
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
