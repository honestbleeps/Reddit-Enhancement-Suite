/* @flow */

import { Module } from '../core/module';
import * as Modules from '../core/modules';
import { isPrivateBrowsing } from '../environment';
import { Thing, batch, isPageType, watchForThings } from '../utils';
import * as ThingHide from '../utils/thingHide';
import * as ReadComments from './readComments';

export const module: Module<*> = new Module('autoHide');

module.moduleName = 'autoHideName';
module.category = 'browsingCategory';
module.description = 'autoHideDesc';

module.options = {
	mustBeVisibleDuration: {
		type: 'text',
		value: '2000',
		description: 'autoHideMustBeVisibleDurationDesc',
		title: 'autoHideMustBeVisibleDurationTitle',
	},
	types: {
		type: 'enum',
		values: [{
			name: 'All',
			value: '',
		}, {
			name: 'Only comments',
			value: 'comment',
		}, {
			name: 'Only link posts',
			value: 'post',
		}],
		value: 'comment',
		description: 'autoHideTypesDesc',
		title: 'autoHideTypesTitle',
	},
};

const thingType = isPageType('comments', 'commentsLinklist') ? 'comment' : 'post';

const hidePost = batch(
	posts => ThingHide.send(ThingHide.HIDE, posts),
	{ size: 50, delay: 5000, flushBeforeUnload: true },
);

module.shouldRun = () => !isPrivateBrowsing();

module.beforeLoad = () => {
	if (module.options.types.value && thingType !== module.options.types.value) return;

	if (thingType === 'comment' && !Modules.isRunning(ReadComments)) {
		console.warn('Auto-hiding comments requires readComments');
		return;
	}

	const mustBeVisibleDuration = parseFloat(module.options.mustBeVisibleDuration.value) || 0;
	const pending: Map<Thing, TimeoutID> = new Map();

	const io = new IntersectionObserver(entries => {
		for (const { target, isIntersecting } of entries) {
			const thing = Thing.checkedFrom(target);
			const id = pending.get(thing);
			if (isIntersecting) {
				pending.set(thing, setTimeout(() => {
					if (thingType === 'post') hidePost(thing);
					else ReadComments.add(thing);

					io.unobserve(target);
					pending.delete(thing);
				}, mustBeVisibleDuration));
			} else if (id) {
				pending.delete(thing);
				clearTimeout(id);
			}
		}
	}, { threshold: [0], rootMargin: '0px 0px -30px 0px' });

	watchForThings([thingType], thing => {
		io.observe(thing.entry);
	});
};
