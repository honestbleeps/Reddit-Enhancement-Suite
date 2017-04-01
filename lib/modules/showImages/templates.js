/* @flow */

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

export const galleryTemplate = /*:: <T> */({ title, caption, credits, src }: {| title?: string, caption?: string, credits?: string, src: T[] |}) => string.html`
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
		<div class="res-gallery-individual-controls">
			<div class="res-step res-gallery-previous"></div>
			<div class="res-step-progress">
				<span class="res-gallery-position">1</span> of ${src.length}
			</div>
			<div class="res-step res-step-reverse res-gallery-next"></div>
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
		<a class="res-expando-link noKeyNav" href="${href}" ${openInNewWindow && string._html('target="_blank" rel="noopener noreferrer"')}>
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
|}) => string.html`
	<div class="video-advanced">
		${title && string._html`
		<h4 class="res-title">${title}</h4>
		`}
		${caption && string._html`
		<div class="res-caption">${string.safe(caption)}</div>
		`}
		${credits && string._html`
		<div class="res-credits">${string.safe(credits)}</div>
		`}
		<div class="video-advanced-container">
			${controls ? string._html`
			<video controls ${muted && 'muted'} ${loop && 'loop'} poster="${poster}"></video>
			` : string._html`
			<a class="noKeyNav" href="${href}" ${openInNewWindow && string._html('target="_blank" rel="noopener noreferrer"')}>
				<video ${muted && 'muted'} ${loop && 'loop'} poster="${poster}"></video>
			</a>
			`}
			${advancedControls ? string._html`
			<div class="video-advanced-interface ${controls && 'video-advanced-push-below'}">
				<div class="video-advanced-progress">
					<div class="video-advanced-position"></div>
					<div class="video-advanced-position-thumb"></div>
				</div>
				<div class="video-advanced-main">
					<div class="video-advanced-controls">
						<div title="Toggle pause" class="res-icon video-advanced-button video-advanced-toggle-pause"></div>
						${reversable && string._html`
						<div title="Reverse video" class="res-icon video-advanced-button video-advanced-reverse"></div>
						`}
						<div class="video-advanced-controls-group video-advanced-current-time">
							<div title="Select previous frame" class="res-icon video-advanced-button video-advanced-time-decrease"></div>
							<div class="video-advanced-time">1.00s</div>
							<div title="Select next frame" class="res-icon video-advanced-button video-advanced-time-increase"></div>
						</div>
						<div class="video-advanced-controls-group video-advanced-playback-rate">
							<div title="Decrease speed by 10%" class="res-icon video-advanced-button video-advanced-speed-decrease"></div>
							<div class="video-advanced-speed">${string.safe(formattedPlaybackRate)}</div>
							<div title="Increase speed by 10%" class="res-icon video-advanced-button video-advanced-speed-increase"></div>
						</div>
					</div>
					<div hidden class="video-advanced-error">
						<div class="res-icon">&#xf15b</div>
					</div>
					<div class="video-advanced-info">
						${source && string._html`
						<a class="video-advanced-link video-advanced-source" href="${source}">source</a>
						`}
						<div class="res-expando-siteAttribution"></div>
					</div>
				</div>
			</div>
			` : string._html`
			<div hidden class="video-advanced-error">
				<div class="res-icon">&#xf15b</div>
			</div>
			`}
		</div>
	</div>
`;

export const mediaControlsTemplate = ({ x, y, downloadUrl, lookupUrl, clippy }: {| x: string, y: string, downloadUrl?: string, lookupUrl?: string, clippy: boolean |}) => string.html`
	<div class="res-media-rotatable">
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
