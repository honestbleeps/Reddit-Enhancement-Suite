/* @flow */

import _ from 'lodash';
import { i18n } from '../environment';
import { $ } from '../vendor';
import {
	DAY,
	Thing,
	isFormDirty,
	watchForElements,
} from '../utils';
import * as Notifications from './notifications';
import * as PenaltyBox from './penaltyBox';
import { makeUrlHashLink } from './settingsNavigation';

export const module = {};

module.moduleID = 'draft';
module.moduleName = 'draftName';
module.category = ['Comments'];
module.description = 'draftDescription';
module.options = {
	confirmAbandonDraft: {
		title: 'draftConfirmAbandonDraftTitle',
		description: 'draftConfirmAbandonDraftDescription',
		type: 'boolean',
		value: true,
	},
	saveDrafts: {
		type: 'boolean',
		value: false,
	},
};

module.include = [
	'comments',
	'inbox',
];

const DRAFT_SELECTOR = 'form.usertext-edit';

module.go = function() {
	$(document.body).on({
		focus: onFocusDraftEditor,
		blur: onBlurDraftEditor,
	}, `${DRAFT_SELECTOR} textarea`);

	$(document.body).on('beforeunload', trackConfirmAbandonDraft);

	if (shouldEvangelizeConfirmAbandonDraft()) {
		evangelizeConfirmAbandonDraft();
	}

	if (module.options.saveDrafts.value) {
		$(document.body).on('submit', DRAFT_SELECTOR, onSaveDraft);
		watchForElements('newCommentsForm', container => new Draft(container).restore());
	}
};

let dirtyOnLastUnload = false;
function trackConfirmAbandonDraft() {
	const d = drafts();
	const dirty = d.some(draft => draft.view.isDirty());
	if (dirty) {
		// User probably just saw reddit's "You have unsaved changes!" confirmation
		// https://github.com/reddit/reddit/blob/bd922104b971a5c6794b199f364a06fdf61359a2/r2/r2/public/static/js/warn-on-unload.js#L48
		PenaltyBox.alterFeaturePenalty(module.moduleID, 'confirmAbandonDraft', 10);

		d.each(draft => draft.store());
	}

	dirtyOnLastUnload = dirty;
}

function onSaveDraft(e: Event) {
	if (dirtyOnLastUnload) {
		// User probably saved a draft after cancelling abandoning it.
		PenaltyBox.alterFeaturePenalty(module.moduleID, 'confirmAbandonDraft', -15);
	}

	new Draft(e.currentTarget).delete();
}

function onFocusDraftEditor(e: Event) {
	if (!module.options.confirmAbandonDraft.value) {
		new DraftView(e.currentTarget).debuffProtection();
	}
}

function onBlurDraftEditor(e: Event) {
	const draft = new Draft(e.currentTarget);

	if (module.options.saveDrafts.value) {
		draft.store();
	}

	if (!module.options.confirmAbandonDraft.value) {
		draft.view.buffProtection();
	}
}

function drafts(container = document.body): Draft[] {
	return Array.from(container.querySelectorAll(DRAFT_SELECTOR)).map(ele => new Draft(ele));
}

function shouldEvangelizeConfirmAbandonDraft() {
	return module.options.confirmAbandonDraft.value &&
		PenaltyBox.getFeaturePenalty(module.moduleID, 'confirmAbandonDraft') === PenaltyBox.MAX_PENALTY;
}

function evangelizeConfirmAbandonDraft() {
	Notifications.showNotification({
		moduleID: module.moduleID,
		optionKey: 'confirmAbandonDraft',
		notificationID: 'clippy',
		closeDelay: 10000,
		cooldown: 7 * DAY,
		header: i18n('notificationClippyTitle'),
		message: `
			${i18n('draftEvangelizeConfirmAbandonDraftMessage')}
			<p>${makeUrlHashLink(module.moduleID, 'confirmAbandonDraft', i18n('notificationOpenSettingsMessage'), 'RESNotificationButtonBlue')}</p>
		`,
	});
}

class Draft {
	constructor(element) {
		this.view = new DraftView(element);
	}

	context(): string {
		return _.once(() => {
			const thing = this.view.thing();
			if (thing) {
				return thing.id();
			} else {
				return `${document.pathname}#${this.view.id}`;
			}
		});
	}

	_storage() {
		return Storage.wrap(`RESmodules.draft.drafts.${this.context()}`);
	}

	store() {
		const value = this.view.value;
		if (value) {
			this._storage().set({
				value,
				date: Date.now(),
			});
		} else {
			this._storage().delete();
		}
	}

	delete() {
		this._storage().delete();
	}

	restore() {
		const stored = this._storage().get();
		if (stored) {
			this.view.value = stored.value;
		}
	}
}


class DraftView {
	constructor(element) {
		this.element = element;
	}

	get thing(): ?Thing {
		try {
			return Thing.checkedFrom(this.view.element);
		} catch (e) {
			// Couldn't find a thing, probably a top-level reply or some other singleton textarea
		}
	}

	get id(): string {
		return $(this.element).closest('form').attr('id');
	}

	get valueElement(): HTMLElement {
		if (typeof this.element.value !== 'string') {
			return this.element.querySelector('textarea');
		}
		return this.element;
	}

	get value(): string {
		const element = this.valueElement();
		return element.placeholder || element.value;
	}

	set value(value): string {
		if (module.options.confirmAbandonDraft.value) {
			this.valueElement().placeholder = value;
		} else {
			this.valueElement().value = value;
		}

		// TODO: trigger change
		return value;
	}

	isDirty() {
		return isFormDirty(this.element);
	}

	buffProtection() {
		const element = this.valueElement();
		if (element.placeholder && element.value === element.defaultValue) {
			element.value = element.placeholder;
			element.placeholder = '';
			// TODO: trigger change
		}
	}

	debuffProtection() {
		const element = this.valueElement();
		element.placeholder = element.value;
		element.value = element.defaultValue;
		// TODO: trigger change
	}
}
