/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';

import { Storage } from '../environment';
import {
	Thing,
	batch,
	loggedInUser,
	string,
	watchForElements,
} from '../utils';

export const module: Module<*> = new Module('subredditVoteTracker');

module.moduleName = 'subredditVoteTrackerName';
module.category = 'subredditsCategory';
module.description = 'subredditVoteTrackerDesc';
module.options = {
	trackVoteRatio: {
		title: 'subredditVoteTrackerTrackVoteRatioTitle',
		type: 'boolean',
		value: true,
		description: 'subredditVoteTrackerTrackVoteRatioDesc',
	},
	renderVoteRatio: {
		title: 'subredditVoteTrackerVRNumberTitle',
		type: 'boolean',
		value: true,
		description: 'subredditVoteTrackerVRNumberDesc',
		dependsOn: options => options.trackVoteRatio.value,
	},
};

export const vrStorage = Storage.wrapPrefix('subredditvote.', () => (({}: any): {|
	votesDown?: number,
	votesUp?: number,
|}), subreddit => subreddit);

const getVRBatched = batch(async subreddits => {
	const voteratios = await vrStorage.getMultipleNullable(subreddits);
	return subreddits.map(subreddit => voteratios[subreddit]);
}, { size: Infinity, delay: 0 });

module.beforeLoad = () => {
	watchForElements(['siteTable'], subredditSelector, applyToSubreddit);
};

module.go = () => {
	// // If we're on the dashboard, add a tab to it...
	// if (isCurrentSubreddit('dashboard')) {
	//	 addDashboardFunctionality();
	// }

	if (module.options.trackVoteRatio.value && loggedInUser()) {
		attachVoteHandler();
	}
};

export const subredditSelector = 'p.tagline a.subreddit, p.parent a.subreddit';

export async function applyToSubreddit(element: *, {
	renderVoteRatio = module.options.trackVoteRatio.value,
}: {|
	renderVoteRatio?: boolean,
|} = {}) {
	const subreddit = Thing.checkedFrom(element).getSubreddit();

	// Get tags immediately so that it can be rendered at once without having to wait for storage
	// since in most cases there's no applied tag
	const vr = SubredditVoteRatio.getUnfilled(subreddit);
	vr.add(element, { renderVoteRatio });
	await vr.fill();
}

export const subredditVotes: Map<string, SubredditVoteRatio> = new Map();

export class SubredditVoteRatio {
	static async getStored(): Promise<Array<SubredditVoteRatio>> {
		return Object.entries(await vrStorage.getAll())
			.map(([k, v]) => {
				const subVR = SubredditVoteRatio.getUnfilled(k);
				subVR.load(v);
				return subVR;
			});
	}

	static getUnfilled(id: string): SubredditVoteRatio {
		let subVR = subredditVotes.get(id);
		if (!subVR) {
			subVR = new SubredditVoteRatio(id);
			subredditVotes.set(id, subVR);
		}
		return subVR;
	}

	static async get(id: string): Promise<SubredditVoteRatio> {
		const subVR = SubredditVoteRatio.getUnfilled(id);
		await subVR.fill();
		return subVR;
	}

	id: string;
	votesUp: number = 0;
	votesDown: number = 0;

	instances: Array<{
		element: HTMLElement,
		vr?: HTMLElement,
	}> = [];

	constructor(id: $PropertyType<this, 'id'> = '~dummy') {
		this.id = id;
	}

	fill = _.once(async () => {
		const data = await getVRBatched(this.id);
		if (data) this.load(data);
	});

	load(data: *) {
		if (data.votesUp !== undefined) this.votesUp = data.votesUp;
		if (data.votesDown !== undefined) this.votesDown = data.votesDown;
		for (const instance of this.instances) this.render(instance);
	}

	extract() {
		return {
			votesDown: this.votesDown,
			votesUp: this.votesUp,
		};
	}

	save() {
		const base = (new SubredditVoteRatio()).extract();
		const data = this.extract();
		vrStorage.set(this.id, _.pickBy(data, (v, k) => base[k] !== v));
	}

	add(element: HTMLAnchorElement, { renderVoteRatio = false }: {| renderVoteRatio?: boolean |} = {}) {
		const instance = { element, renderVoteRatio };
		this.instances.push(instance);
		this.render(instance);
	}

	render(instance: *) {
		if (instance.vr) instance.vr.remove();
		if (instance.renderVoteRatio) {
			instance.vr = string.html`
				<span class="RESSubredditVotes">(<span class="${this.votesUp > 0 ? 'up' : 'neutral'}">${this.votesUp}</span>|<span class="${this.votesDown > 0 ? 'down' : 'neutral'}">${this.votesDown}</span>)</span>
			`;
			instance.element.after(instance.vr);
		}
	}
}

function attachVoteHandler() {
	// hand-rolled delegated listener because jQuery doesn't support useCapture
	// which is necessary so we run before reddit's handler
	document.body.addEventListener('click', (e: MouseEvent) => {
		if (e.button !== 0) return;
		if (e.target.classList.contains('arrow')) {
			handleVoteClick(e.target);
		}
	}, true);
}

async function handleVoteClick(arrow) {
	const $this = $(arrow);
	const $otherArrow = $this.siblings('.arrow');

	// Stop if the post is archived (unvotable)
	if ($this.hasClass('archived')) {
		return;
	}

	// there are 6 possibilities here:
	// 1) no vote yet, click upmod
	// 2) no vote yet, click downmod
	// 3) already upmodded, undoing
	// 4) already downmodded, undoing
	// 5) upmodded before, switching to downmod
	// 6) downmodded before, switching to upmod

	// classes are changed AFTER this event is triggered
	let up = 0;
	let down = 0;
	if ($this.hasClass('up')) {
		// adding an upvote
		up = 1;
		if ($otherArrow.hasClass('downmod')) {
			// also removing a downvote
			down = -1;
		}
	} else if ($this.hasClass('upmod')) {
		// removing an upvote directly
		up = -1;
	} else if ($this.hasClass('down')) {
		// adding a downvote
		down = 1;
		if ($otherArrow.hasClass('upmod')) {
			// also removing an upvote
			up = -1;
		}
	} else if ($this.hasClass('downmod')) {
		// removing a downvote directly
		down = -1;
	}

	// must load votes object _after_ checking the DOM, so that classes will not be changed
	const thing = Thing.checkedFrom(arrow);
	const subreddit = thing.getSubreddit();
	const subVR = subreddit && await SubredditVoteRatio.get(subreddit);
	if (!subVR) throw new Error('No votes for subreddit');
	subVR.load({
		votesUp: subVR.votesUp + up,
		votesDown: subVR.votesDown + down,
	});
	subVR.save();
}
