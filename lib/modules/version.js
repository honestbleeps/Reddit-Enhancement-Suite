/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Metadata from '../core/metadata';
import { getExtensionId } from '../environment';
import {
	BodyClasses,
	range,
	string,
} from '../utils';

export const module: Module<*> = new Module('version');

module.moduleName = 'versionName';
module.category = 'aboutCategory';
module.description = 'versionDesc';
module.alwaysEnabled = true;
module.hidden = true;

const concurrentInstallWiki = '/r/Enhancement/wiki/tutorials/concurrent_installs';

module.beforeLoad = () => {
	addVersionClasses();
};

module.go = () => {
	reportVersion();
};

module.afterLoad = () => {
	avoidConcurrentInstalls();
};

function addVersionClasses() {
	BodyClasses.add('res');
	const versionComponents = Metadata.version.split('.');
	for (const i of range(0, versionComponents.length)) {
		BodyClasses.add(`res-v${versionComponents.slice(0, i + 1).join('-')}`);
	}
}

function reportVersion() {
	// report the version of RES to reddit's advisory checker.
	$('<div>', {
		id: 'RESConsoleVersion',
		style: 'display: none;',
		text: Metadata.version,
		'data-id': getExtensionId(),
	}).appendTo(document.body);
}

function avoidConcurrentInstalls() {
	const installs = Array.from(document.querySelectorAll('#RESConsoleVersion'));
	// versions before 5.6.2 will not report their id, so assume they are unique
	const concurrentInstalls = _.uniqBy(installs, e => e.getAttribute('data-id') || Math.random())
		.map(e => e.textContent);

	if (concurrentInstalls.length > 1) {
		BodyClasses.add('res-concurrent-installs');
		document.body.appendChild(string.html`
			<div id="res-concurrent-installs">
				<p>You have enabled multiple versions of Reddit Enhancement Suite:</p>
				<ul>
					${concurrentInstalls.map(v => string._html`
						<li>${v}</li>
					`)}
				</ul>
				<p>You should enable only one. <a href="${concurrentInstallWiki}">Find out how!</a>
			</div>
		`);
	}
}
