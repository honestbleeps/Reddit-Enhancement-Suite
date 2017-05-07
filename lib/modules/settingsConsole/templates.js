/* @flow */

import { i18n } from '../../environment';
import { string } from '../../utils';

export const consoleContainerTemplate = ({ name, version, gitDescription }: {| name: string, version: string, gitDescription: string |}) => string.html`
	<div id="RESConsoleContainer">
		<div id="RESConsoleHeader">
			<div id="RESConsoleTopBar" class="RESDialogTopBar">
				<div id="RESLogo"></div>
				<h1>${name}</h1>
				<div id="RESConsoleVersionDisplay" title="${gitDescription}">v${version}</div>
	
	
				<button id="moduleOptionsSave">save options</button>
				<div id="moduleOptionsSaveStatus" class="saveStatus" style="display: none;">Options have been saved...</div>
				<a id="RESConsoleSubredditLink" href="/r/Enhancement" alt="The RES Subreddit">/r/Enhancement</a>
				<span id="RESClose" class="RESCloseButton">×</span>
			</div>
		</div>
	
		<div id="RESConsoleContent">
			<div id="RESConfigPanelModulesPane">
				<div id="SearchRES-input-container"></div>
	
				<div id="RESConfigPanelModulesList"></div>
	
				<label id="RESAllOptionsSpan">
					<input id="RESAllOptions" type="checkbox">
					<span>Show advanced options</span>
				</label>
			</div>
			<div id="RESConfigPanelOptions">
				<div class="moduleHeader">
					<span class="moduleName">Module Name</span>
					<div class="moduleToggle toggleButton enabled" moduleID="moduleID">
						<span class="toggleThumb"></span>
						<div class="toggleLabel" data-enabled-text="${i18n('toggleOn')}" data-disabled-text="${i18n('toggleOff')}"></div>
					</div>
	
					<div class="moduleDescription"></div>
				</div>
				<div id="allOptionsContainer"></div>
				<div id="noOptions" class="optionContainer">
					There are no configurable options for this module.
				</div>
			</div>
		</div>
	</div>
`;

export const moduleSelectorTemplate = (categories: Array<{ name: string, translatedName: string, modules: Array<{ isEnabled: boolean, moduleID: string, translatedName: string, description: string, shortDescription: string }> }>) => string.html`
	<ul>
		${categories.map(({ name, translatedName, modules }) => string._html`
			<li class="RESConfigPanelCategory" data-category="${name}">
				<h3 class="categoryButton" data-category="${name}">${translatedName}</h3>
				<ul>
					${modules.map(({ isEnabled, moduleID, translatedName, description, shortDescription }) => string._html`
						<li class="moduleButton ${isEnabled && 'enabled'}" data-module="${moduleID}" title="${description}">
							${translatedName}
							<small>
								${shortDescription}
							</small>
						</li>
					`)}
				</ul>
			</li>
		`)}
	</ul>
`;
