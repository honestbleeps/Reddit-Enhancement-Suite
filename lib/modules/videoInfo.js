/* @flow */
import {
	DAY,
	batch,
	downcast,
	formatDateDiff,
	fromSecondsToTime,
	string,
} from '../utils';
import { ajax, i18n } from '../environment';

export function fromYoutubeTimecodeToSeconds(tc: string) {
	let timeSeconds = Number(tc);
	if (Number.isNaN(timeSeconds)) {
		const tcobj = (tc.split(/(\d+[hms])/)
			.filter(Boolean)
			.reduce((acc, match) => {
				acc[match.slice(-1)] = Number(match.slice(0, -1));
				return acc;
			}, {}));
		timeSeconds = (tcobj.h || 0) * 3600 + (tcobj.m || 0) * 60 + (tcobj.s || 0);
	}
	return timeSeconds;
}

export async function getVideoTimes(thing) {
	const element = thing.element.querySelector('a.title[href*="youtube.com"], a.title[href*="youtu.be"]');
	if (!element) return;
	const link = downcast(element, HTMLAnchorElement);

	const titleHasTimeRegex = /[\[|\(][0-9]*:[0-9]*[\]|\)]/;
	const getYoutubeIDRegex = /\/?[&|\?]?v\/?=?([\w\-]{11})&?/i;
	const getShortenedYoutubeIDRegex = /([\w\-]{11})&?/i;
	const getYoutubeStartTimeRegex = /\/?[&|\?]?(?:t|time_continue)=([\w\-][a-z0-9]*)/i;

	const isShortened = (/youtu\.be/i).test(link.href);

	const match = isShortened ?
		getShortenedYoutubeIDRegex.exec(link.href) :
		getYoutubeIDRegex.exec(link.href);

	if (!match) return;

	const timeMatch = getYoutubeStartTimeRegex.exec(link.href);
	const titleMatch = titleHasTimeRegex.test(link.textContent);

	let startTime;
	if (timeMatch && !titleMatch) {
		const seconds = fromYoutubeTimecodeToSeconds(timeMatch[1]);
		startTime = fromSecondsToTime(seconds);
	}

	const { info, duration, title } = await getVideoInfo(match[1]);

	requestAnimationFrame(() => {
		if (info.length) {
			link.appendChild(string.html`<span class="gray pay-link">${string.safe(info.join(' '))}</span>`);
		}
		link.setAttribute('title', i18n('betteRedditVideoYouTubeTitle', title));

		if (module.options.videoTimes.value) {
			// Add native Reddit duration overlay on video thumbnail
			const thumbnail = thing.element.querySelector('a.thumbnail');
			if (thumbnail) {
				thumbnail.appendChild(string.html`<div class="duration-overlay">${duration}${startTime ? ` (@${startTime})` : ''}</div>`);
			}
		}
	});
}

export const getVideoInfo = batch(async videoIds => {
	const parts = ['id', 'contentDetails', 'snippet'];
	const fields = ['id', 'contentDetails(duration)', 'snippet(title,publishedAt)'];
	if (module.options.videoViewed.value) {
		parts.push('statistics');
		fields.push('statistics(viewCount)');
	}

	const { items } = await ajax({
		url: 'https://www.googleapis.com/youtube/v3/videos',
		query: {
			id: videoIds.join(','),
			part: parts.join(','),
			fields: `items(${fields.join(',')})`,
			key: 'AIzaSyB8ufxFN0GapU1hSzIbuOLfnFC0XzJousw',
		},
		type: 'json',
		cacheFor: DAY,
	});

	const results = items.map(({ id, contentDetails, snippet, statistics }) => {
		const title = snippet.title;
		const rawDuration = contentDetails.duration; // PT1H11M46S
		const duration = ['0']
			.concat(rawDuration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i).slice(1))
			.map(time => `0${time || 0}`.slice(-2))
			.filter((time, i, { length }) => +time !== 0 || i >= length - 2)
			.join(':');

		const info = [];

		if (module.options.videoUploaded.value) {
			const uploaded = new Date(snippet.publishedAt); // 2016-01-27T05:49:48.000Z
			const dt = `${uploaded.toDateString()} ${uploaded.toTimeString()}`;
			const timeAgo = i18n('submitHelperTimeAgo', formatDateDiff(uploaded));
			info.push(`[<time title="${dt}" datetime="${snippet.publishedAt}" class="live-timestamp">${timeAgo}</time>]`);
		}

		if (module.options.videoViewed.value) {
			const viewed = statistics.viewCount;
			info.push(i18n('betteRedditVideoViewed', viewed));
		}

		return { id, duration, info, title };
	});

	return videoIds.map(idFromBatch => results.find(({ id }) => id === idFromBatch));
}, { size: 50 });
