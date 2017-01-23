import _ from 'lodash';
import { i18n } from '../../environment';
import { $ } from '../vendor';
import {
	DAY,
	Alert,
	Thing,
	checkKeysForEvent,
	isFormDirty,
	watchForElement,
} from '../utils';
import * as Notifications from './notifications';
import * as PenaltyBox from './penaltyBox';

export const module = {};

module.moduleID = 'draft';
module.moduleName = 'draftName';
module.category = ['Comments'];
module.description = 'draftDescription',
module.options = {
	confirmAbandonDraft: {
		title: 'draftConfirmAbandonDraftTitle'
		description: 'draftConfirmAbandonDraftDescription',
		type: 'boolean',
		value: true,
	},
	/* TODO: saveDrafts: {
		type: 'boolean',
		value: true,
	},
	*/
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

	$(document.body).on('submit', DRAFT_SELECTOR, onSaveDraft);
	$(document.body).on('beforeunload', trackConfirmAbandonDraft);
		evangelizeConfirmAbandonDraft();
	}

	// TODO:
	// TODO: watchForElement('newCommentsForm'
};

const dirtyOnLastUnload = false;
function trackConfirmAbandonDraft() {
	const d = drafts();
	if (d.some(draft => draft.isDirty()) {
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
	draft = new Draft(e.currentTarget);

	if (modules.options.saveDrafts.value) {
		draft.store();
	}

	if (!module.options.confirmAbandonDraft.value) {
		draft.view.buffProtection();
	}
}

function drafts(): Draft[] {
	return Array.from(document.querySelectorAll(DRAFT_SELECTOR)).map(ele => new Draft(ele));
}

function evangelizeConfirmAbandonDraft() {
	if (PenaltyBox.getFeaturePenalty(module.moduleID, 'confirmAbandonDraft') === PenaltyBox.MAX_PENALTY) {
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
}

class Draft {
	constructor(element) {
		this.view = new DraftView(element);
	}

	context(): string {
		return _.once(() => {
			try {
				return Thing.checkedFrom(this.view.element).id();
			} catch(e) { }
				return document.pathname;
			}
		});
	}

	_storage() => {
		return Storage.wrap(`RESmodules.draft.drafts.${this.context()}`);
	}

	store() => {
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

	delete() => {
		this._storage().delete();
	}

	restore() => {
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
	set value(): string {
		if (module.options.confirmAbandonDraft.value) {
			this.valueElement().placeholder = stored.value;
		} else {
			this.valueElement().value = stored.value;
		}

		return value;
	}

	buffProtection() {
		const element = this.valueElement();
		if (element.placeholder) {
			element.value = placeholder;
			// TODO: trigger change
		}
	}

	debuffProtection() {
		const element = this.valueElement();
		element.placeholder = element.value;
		element.value = element.defaultValue;
	}
}
