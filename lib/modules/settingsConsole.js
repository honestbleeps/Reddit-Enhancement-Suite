addModule('settingsConsole', function(module, moduleID) {
	module.moduleName = 'Settings Console';
	module.category = 'Core';
	module.description = 'Manage your RES settings and preferences';
	module.alwaysEnabled = true;
	module.hidden = true;

	var AUTOSTAGE_DEBOUNCE_NAME = 'RESSettings.autostage';

	var modalOverlay, keyCodeModal, RESConsoleContainer, moduleOptionsScrim, saveButton, moduleToggle,
		captureKey, captureKeyID, currentModule;

	module.beforeLoad = function() {
		renderMenuItem();
	};
	module.go = function() {
		addMenuItem();
	};

	function renderMenuItem() {
		module.menuItem = RESUtils.createElement('div', 'SettingsConsole', null, 'RES settings console');
	}

	function addMenuItem() {
		function onClick() {
			modules['RESMenu'].hidePrefsDropdown();
			module.open();
		}
		modules['RESMenu'].addMenuItem(module.menuItem, onClick, true);
	}

	function create() {
		populateCategories();
		RESTemplates.load('settingsConsole', _create);
	}

	function _create(template) {
		// create the console container
		RESConsoleContainer = template.html(RESMetadata)[0];
		// hide it by default...
		// create a modal overlay
		modalOverlay = RESUtils.createElement('div', 'modalOverlay');
		modalOverlay.addEventListener('click', function(e) {
			e.preventDefault();
			return false;
		}, true);
		document.body.appendChild(modalOverlay);

		var RESClose = RESConsoleContainer.querySelector('#RESClose');
		RESClose.addEventListener('click', function(e) {
			e.preventDefault();
			module.close();
		}, true);


		var RESAdvOptionsSpan = RESConsoleContainer.querySelector('#RESAllOptionsSpan');
		RESAdvOptionsSpan.setAttribute('title', modules['settingsNavigation'].options.showAllOptions.description);

		var RESAdvOptions = RESAdvOptionsSpan.querySelector('input');
		RESAdvOptions.addEventListener('change', function(e) {
			RESUtils.options.setOption('settingsNavigation', 'showAllOptions', this.checked);
			updateAdvancedOptionsVisibility();
		}, true);

		// create the menu
		RESTemplates.load('settingsConsoleModuleSelector', function(template) {
			var modulesSelector = template.html({ categories: module.categories });
			$(RESConsoleContainer).find('#RESConfigPanelModulesList').html(modulesSelector);
		});

		$(RESConsoleContainer).find('#RESConfigPanelModulesPane')
			.on('click', '.moduleButton', function(e) {
				var id = $(this).data('module');
				if (id) {
					e.preventDefault();
					showConfigOptions(id);
				}
			})
			.on('click', '.categoryButton', function(e) {
				var id = $(this).data('category');
				if (id) {
					e.preventDefault();
					openCategoryPanel(id);
				}
			});

		module.RESConsoleContent = RESConsoleContainer.querySelector('#RESConsoleContent');
		if (modules['settingsNavigation'].options.showAllOptions.value) {
			RESAdvOptions.checked = true;
		} else {
			module.RESConsoleContent.classList.add('advanced-options-disabled');
		}
		module.RESConfigPanelOptions = RESConsoleContainer.querySelector('#RESConfigPanelOptions');

		modules['search'].renderSearchForm(RESConsoleContainer);

		// Okay, the console is done. Add it to the document body.
		document.body.appendChild(RESConsoleContainer);

		window.addEventListener('keydown', function(e) {
			if (captureKey && (e.keyCode !== 16) && (e.keyCode !== 17) && (e.keyCode !== 18)) {
				// capture the key, display something nice for it, and then close the popup...
				e.preventDefault();
				var keyArray;
				if (e.keyCode === 8) { // backspace, we disable the shortcut
					keyArray = [-1, false, false, false, false];
				} else {
					keyArray = [e.keyCode, e.altKey, e.ctrlKey, e.shiftKey, e.metaKey];
				}
				// not using .getElementById here due to a collision with reddit's elements (i.e. #modmail)
				module.RESConfigPanelOptions.querySelector('[id="' + captureKeyID + '"]').value = keyArray.join(',');
				module.RESConfigPanelOptions.querySelector('[id="' + captureKeyID + '-display"]').value = RESUtils.niceKeyCode(keyArray);
				keyCodeModal.style.display = 'none';
				captureKey = false;
			}
		});

		$(module.RESConsoleContent).on({
			focus: function(e) {
				// show dialog box to grab keycode, but display something nice...
				$(keyCodeModal).css({
					display: 'block',
					top: RESUtils.mouseY + 'px',
					left: RESUtils.mouseX + 'px'
				});
				captureKey = true;
				captureKeyID = this.getAttribute('capturefor');
			},
			blur: function(e) {
				$(keyCodeModal).css('display', 'none');
			}
		}, '.keycode + input[type=text][displayonly]');

		keyCodeModal = RESUtils.createElement('div', 'keyCodeModal');
		$(keyCodeModal).text('Press a key (or combination with shift, alt and/or ctrl) to assign this action.');
		document.body.appendChild(keyCodeModal);
	}

	function populateCategories() {
		var categories = [];
		var modulesByCategory = {};

		for (var moduleID in modules) {
			var mod = modules[moduleID];
			if (mod.hidden) continue;

			var moduleCategories = [].concat(mod.category);
			moduleCategories.forEach(function(category) {
				if (category && !modulesByCategory[category]) {
					categories.push(category);
					modulesByCategory[category] = [];
				}
				modulesByCategory[category].push({
					moduleID: mod.moduleID,
					moduleName: mod.moduleName,
					isEnabled: mod.isEnabled(),
					sort: mod.sort
				});
			});
		}

		var categoryNames = Object.getOwnPropertyNames(modulesByCategory);

		var categorySortSpec = RESMetadata.categories.slice(0).map(function(a) { return a.toLocaleLowerCase(); }),
			presortedCategories = [],
			unsortedCategories = [];
		categoryNames.forEach(function(category) {
			var index = categorySortSpec.indexOf(category.toLocaleLowerCase());
			if (index !== -1) {
				presortedCategories[index] = category;
			} else {
				unsortedCategories.push(category);
			}
		});
		unsortedCategories.sort(function(a, b) {
			return a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase());
		});
		var splice = categorySortSpec.indexOf('*');
		if (splice === -1) {
			categoryNames = presortedCategories.concat(unsortedCategories);
		} else {
			categoryNames = presortedCategories.slice(0, splice)
							.concat(unsortedCategories)
							.concat(presortedCategories.slice(splice + 1));
		}

		categories = categoryNames.map(function(category) {
			var modules = modulesByCategory[category];
			if (modules && modules.length) {
				return {
					name: category,
					modules: modules
				};
			}
		}).filter(function(category) {
			return !!category;
		});

		categories.forEach(function(category) {
			category.modules.sort(function(a, b) {
				var sort = 0;
				if (a.sort == b.sort) {
					sort = a.moduleName.toLocaleLowerCase().localeCompare(b.moduleName.toLocaleLowerCase());
				}  else {
					sort = (a.sort || 0) - (b.sort || 0);
				}

				return sort;
			});
		});

		module.categories = categories;
	}

	function updateSelectedModule(moduleID) {
		var items = $(RESConsoleContainer).find('.moduleButton');

		var selected = items.filter(function() {
			var thisValue = $(this).data('module');

			return thisValue === moduleID;
		});
		items.not(selected).removeClass('active');
		selected.addClass('active');

		var category = (category = modules[moduleID]) && category.category;
		openCategoryPanel(category);
	}

	function drawOptionInput(moduleID, optionName, optionObject, isTable) {
		var thisOptionFormEle;
		switch (optionObject.type) {
			case 'textarea':
				// textarea...
				thisOptionFormEle = RESUtils.createElement('textarea', optionName);
				thisOptionFormEle.setAttribute('type', 'textarea');
				thisOptionFormEle.setAttribute('moduleID', moduleID);
				// this is typed user input and therefore safe, we allow HTML for a few settings.
				$(thisOptionFormEle).html(escapeHTML(optionObject.value));
				break;
			case 'text':
				// text...
				thisOptionFormEle = RESUtils.createElement('input', optionName);
				thisOptionFormEle.setAttribute('type', 'text');
				thisOptionFormEle.setAttribute('moduleID', moduleID);
				thisOptionFormEle.setAttribute('placeHolder', optionObject.placeHolder || '');
				if (typeof optionObject.value !== 'undefined') {
					thisOptionFormEle.setAttribute('value', optionObject.value);
				}
				break;
			case 'color':
				// color...
				thisOptionFormEle = RESUtils.createElement('input', optionName);
				thisOptionFormEle.setAttribute('type', 'color');
				thisOptionFormEle.setAttribute('moduleID', moduleID);
				// thisOptionFormEle.setAttribute('value', optionObject.value); // didn't work on chrome, need to work with .value
				if (typeof optionObject.value !== 'undefined') {
					thisOptionFormEle.value = optionObject.value;
				}
				break;
			case 'button':
				// button...
				thisOptionFormEle = RESUtils.createElement('button', optionName);
				thisOptionFormEle.classList.add('RESConsoleButton');
				thisOptionFormEle.setAttribute('moduleID', moduleID);
				thisOptionFormEle.textContent = optionObject.text;
				if (typeof optionObject.callback === 'function') {
					thisOptionFormEle.addEventListener('click', optionObject.callback, false);
				}
				break;
			case 'list':
				// list...
				thisOptionFormEle = RESUtils.createElement('input', optionName);
				thisOptionFormEle.setAttribute('class', 'RESInputList');
				thisOptionFormEle.setAttribute('type', 'text');
				thisOptionFormEle.setAttribute('moduleID', moduleID);
				// thisOptionFormEle.setAttribute('value', optionObject.value);
				var existingOptions = optionObject.value;
				if (typeof existingOptions === 'undefined') existingOptions = '';

				var optionArray, prepop, listSpec;
				optionArray = existingOptions.split(',');
				prepop = optionArray.filter(function(option) {
					return option !== '';
				}).map(function(option) {
					return {
						id: option,
						name: option
					};
				});
				listSpec = RESUtils.options.listTypes[optionObject.listType] || optionObject;

				setTimeout(function() {
					$(thisOptionFormEle).tokenInput(listSpec.source, {
						method: 'POST',
						queryParam: 'query',
						theme: 'facebook',
						allowFreeTagging: true,
						zindex: 999999999,
						onResult: (typeof listSpec.onResult === 'function') ? listSpec.onResult : null,
						onCachedResult: (typeof listSpec.onCachedResult === 'function') ? listSpec.onCachedResult : null,
						prePopulate: prepop,
						hintText: (typeof listSpec.hintText === 'string') ? listSpec.hintText : null
					});
				}, 100);
				break;
			case 'password':
				// password...
				thisOptionFormEle = RESUtils.createElement('input', optionName);
				thisOptionFormEle.setAttribute('type', 'password');
				thisOptionFormEle.setAttribute('moduleID', moduleID);
				if (typeof optionObject.value !== 'undefined') {
					thisOptionFormEle.setAttribute('value', optionObject.value);
				}
				break;
			case 'boolean':
				// checkbox
				/*
				var thisOptionFormEle = RESUtils.createElement('input', optionName);
				thisOptionFormEle.setAttribute('type','checkbox');
				thisOptionFormEle.setAttribute('moduleID',moduleID);
				thisOptionFormEle.setAttribute('value',optionObject.value);
				if (optionObject.value) {
					thisOptionFormEle.setAttribute('checked',true);
				}
				*/
				thisOptionFormEle = RESUtils.createElement.toggleButton(moduleID, optionName, optionObject.value, null, null, isTable);
				break;
			case 'enum':
				// radio buttons
				if (typeof optionObject.values === 'undefined') {
					alert('misconfigured enum option in module: ' + moduleID);
				} else {
					thisOptionFormEle = RESUtils.createElement('div', optionName);
					thisOptionFormEle.setAttribute('class', 'enum');
					optionObject.values.forEach(function(optionValue, index) {
						var thisId = optionName + '-' + index;
						var thisOptionFormSubEle = RESUtils.createElement('input', thisId);
						if (isTable) thisOptionFormSubEle.setAttribute('tableOption', 'true');
						thisOptionFormSubEle.setAttribute('type', 'radio');
						thisOptionFormSubEle.setAttribute('name', optionName);
						thisOptionFormSubEle.setAttribute('moduleID', moduleID);
						thisOptionFormSubEle.setAttribute('value', optionValue.value);
						var nullEqualsEmpty = ((optionObject.value === null) && (optionValue.value === ''));
						// we also need to check for null == '' - which are technically equal.
						if ((optionObject.value === optionValue.value) || nullEqualsEmpty) {
							thisOptionFormSubEle.setAttribute('checked', 'checked');
						}
						var thisLabel = document.createElement('label');
						thisLabel.setAttribute('for', thisId);
						$(thisLabel).safeHtml(' ' + optionValue.name + ' ' /* security note: the name property is hardcoded, not user input */);
						thisOptionFormEle.appendChild(thisOptionFormSubEle);
						thisOptionFormEle.appendChild(thisLabel);
						var thisBR = document.createElement('br');
						thisOptionFormEle.appendChild(thisBR);
					});
				}
				break;
			case 'keycode':
				// keycode - shows a key value, but stores a keycode and possibly shift/alt/ctrl combo.
				var realOptionFormEle = $('<input>').attr({
					id: optionName,
					type: 'text',
					class: 'keycode',
					moduleID: moduleID
				}).css({
					border: '1px solid red',
					display: 'none'
				}).val(optionObject.value);
				if (isTable) realOptionFormEle.attr('tableOption', 'true');

				var thisKeyCodeDisplay = $('<input>').attr({
					id: optionName + '-display',
					type: 'text',
					capturefor: optionName,
					displayonly: 'true'
				}).val(RESUtils.niceKeyCode(optionObject.value));
				thisOptionFormEle = $('<div>').append(realOptionFormEle).append(thisKeyCodeDisplay)[0];
				break;
			default:
				console.log('misconfigured option in module: ' + moduleID);
				break;
		}
		if (isTable) {
			thisOptionFormEle.setAttribute('tableOption', 'true');
		}
		return thisOptionFormEle;
	}

	function showConfigOptions(moduleID) {
		if (!modules[moduleID]) return;

		drawConfigOptions(moduleID);
		updateSelectedModule(moduleID);
		currentModule = moduleID;

		module.RESConsoleContent.scrollTop = 0;

		modules['settingsNavigation'].setUrlHash(moduleID);
	}

	var _didDrawSettingsConsole;
	function drawSettingsConsole() {
		if (_didDrawSettingsConsole) return;
		_didDrawSettingsConsole = true;

		// put in the description, and a button to enable/disable the module, first..
		var thisToggle = RESConsoleContainer.querySelector('.moduleToggle');
		moduleToggle = thisToggle;

		$(thisToggle)
			.toggle(!modules[moduleID].alwaysEnabled)
			.toggleClass('enabled', modules[moduleID].isEnabled())
			.data('module', moduleID);

		$(thisToggle)
			.toggle(!modules[moduleID].alwaysEnabled)
			.toggleClass('enabled', modules[moduleID].isEnabled())
			.data('module', moduleID);

		thisToggle.addEventListener('click', function(e) {
			var moduleID = $(this).data('module'),
				$moduleButton = $(RESConsoleContainer).find('.moduleButton').filter(function() {
					return $(this).data('module') === moduleID;
				}),
				enabled = this.classList.contains('enabled');

			var enable = !enabled;
			$(thisToggle).add($moduleButton).add(this.classList)
				.toggleClass('enabled', enable);
			updateSaveButton(enable && Object.getOwnPropertyNames(modules[moduleID].options).length);
			$(moduleOptionsScrim)
				.toggleClass('visible', !enable);

			RESUtils.options.enableModule(moduleID, !enabled);
		}, true);

		function saveModuleOptions(e) {
			e.preventDefault();
			saveCurrentModuleOptions();
		}

		saveButton = RESConsoleContainer.querySelector('#moduleOptionsSave');
		saveButton.addEventListener('click', saveModuleOptions, true);
	}

	function drawConfigOptions(moduleID) {
		drawSettingsConsole();
		if (modules[moduleID] && modules[moduleID].hidden) return;
		var thisOptions = getOptions(moduleID),
			optCount = 0,
			thisDescription, allOptionsContainer,
			thisOptionContainer, containerID, thisLabel,
			thisOptionFormEle,
			i, dep;

		// TODO: potentially use markdown instead of HTML for descriptions and convert on the
		// fly with SnuOwnd. Using .html() is safe here because we control each module's
		// description field, but for future code review sanity we should consider updating.
		if (typeof modules[moduleID].onConsoleOpen === 'function') {
			modules[moduleID].onConsoleOpen();
		}

		RESConsoleContainer.querySelector('.moduleName').textContent = modules[moduleID].moduleName;

		$(moduleToggle)
			.toggle(!modules[moduleID].alwaysEnabled)
			.toggleClass('enabled', modules[moduleID].isEnabled())
			.data('module', moduleID);
		updateSaveButton(Object.getOwnPropertyNames(thisOptions).length > 0);
		thisDescription = RESConsoleContainer.querySelector('.moduleDescription');
		$(thisDescription).html(modules[moduleID].description);

		allOptionsContainer = RESConsoleContainer.querySelector('#allOptionsContainer');
		$(allOptionsContainer).empty();
		// now draw all the options...
		for (i in thisOptions) {
			if (!thisOptions[i].noconfig) {
				optCount++;
				containerID = 'optionContainer-' + moduleID + '-' + i;
				thisOptionContainer = RESUtils.createElement('div', containerID, 'optionContainer');
				dep = thisOptions[i].dependsOn;
				if (dep) {
					// if the option this one depends on is false, hide it
					if (!thisOptions[dep].value) {
						thisOptionContainer.setAttribute('style', 'display: none;');
					}
				}

				if (thisOptions[i].advanced) {
					thisOptionContainer.classList.add('advanced');
				}
				thisLabel = RESUtils.createElement('label', null, 'optionTitle');
				thisLabel.setAttribute('for', i);
				var niceDefaultOption = null;
				switch (thisOptions[i].type) {
					case 'textarea':
					case 'text':
					case 'password':
					case 'list':
						niceDefaultOption = thisOptions[i].default;
						break;
					case 'color':
						niceDefaultOption = thisOptions[i].default;
						if (thisOptions[i].default.substr(0, 1) === '#') {
							niceDefaultOption += ' (R:' + parseInt(thisOptions[i].default.substr(1, 2), 16) + ', G:' + parseInt(thisOptions[i].default.substr(3, 2), 16) + ', B:' + parseInt(thisOptions[i].default.substr(5, 2), 16) + ')';
						}
						break;
					case 'boolean':
						niceDefaultOption = thisOptions[i].default ? 'on' : 'off';
						break;
					case 'enum':
						thisOptions[i].values.some(function(thisValue) {
							if (thisOptions[i].default === thisValue.value) {
								niceDefaultOption = thisValue.name;
								return true;
							}
						});
						break;
					case 'keycode':
						niceDefaultOption = RESUtils.niceKeyCode(thisOptions[i].default);
						break;
				}
				if (niceDefaultOption !== null) {
					thisLabel.setAttribute('title', 'Default: ' + niceDefaultOption);
				}
				$(thisLabel).text(i);
				var thisOptionDescription = RESUtils.createElement('div', null, 'optionDescription');
				var thisOptionSetting = RESUtils.createElement('div', null, 'optionSetting');
				// TODO: same as above in this function, let's use markdown in the future
				$(thisOptionDescription).html(thisOptions[i].description);
				thisOptionContainer.appendChild(thisLabel);
				thisOptionContainer.appendChild(thisOptionSetting);
				if (thisOptions[i].type === 'table') {
					var isFixed = thisOptions[i].addRowText === false; // set addRowText value to false to disable additing/removing/moving of row
					thisOptionContainer.classList.add('table');
					var thisTbody;
					// table - has a list of fields (headers of table), users can add/remove rows...
					if (typeof thisOptions[i].fields === 'undefined') {
						alert('Misconfigured table option in module: ' + moduleID + ' - options of type "table" must have fields defined.');
					} else {
						// get field names...
						var fieldNames = [];
						// now that we know the field names, get table rows...
						var thisTable = document.createElement('table');
						thisTable.setAttribute('moduleID', moduleID);
						thisTable.setAttribute('optionName', i);
						thisTable.setAttribute('class', 'optionsTable');
						var thisThead = document.createElement('thead');
						var thisTableHeader = document.createElement('tr'),
							thisTH;
						thisTable.appendChild(thisThead);
						thisOptions[i].fields.forEach(function(field) {
							fieldNames.push(field.name);
							thisTH = document.createElement('th');
							$(thisTH).text(field.name);
							thisTableHeader.appendChild(thisTH);
						});
						if (!isFixed) {
							// add delete column
							thisTH = document.createElement('th');
							thisTableHeader.appendChild(thisTH);
							// add move column
							thisTH = document.createElement('th');
							$(thisTableHeader).prepend(thisTH);
						}
						thisThead.appendChild(thisTableHeader);
						thisTable.appendChild(thisThead);
						thisTbody = document.createElement('tbody');
						thisTbody.setAttribute('id', 'tbody_' + i);
						var thisTR, thisTD;
						if (thisOptions[i].value) {
							thisOptions[i].value.forEach(function(thisValue, j) {
								thisTR = document.createElement('tr');
								$(thisTR).data('itemidx-orig', j);
								thisOptions[i].fields.forEach(function(thisOpt, k) {
									thisTD = document.createElement('td');
									thisTD.className = 'hasTableOption';
									var thisFullOpt = i + '_' + thisOpt.name;
									thisOpt.value = thisValue[k];
									// var thisOptInputName = thisOpt.name + '_' + j;
									var thisOptInputName = thisFullOpt + '_' + j;
									var thisTableEle = drawOptionInput(moduleID, thisOptInputName, thisOpt, true);
									thisTD.appendChild(thisTableEle);
									thisTR.appendChild(thisTD);
								}, this);
								if (!isFixed) {
									addTableButtons(thisTR);
								}
								thisTbody.appendChild(thisTR);
							}, this);
						}
						thisTable.appendChild(thisTbody);
						thisOptionFormEle = thisTable;
					}
					$(thisOptionDescription).insertAfter(thisLabel);
					if (!isFixed) {
						// Create an "add row" button...
						var addRowText = thisOptions[i].addRowText || 'Add Row';
						var addRowButton = document.createElement('input');
						addRowButton.classList.add('addRowButton');
						addRowButton.setAttribute('type', 'button');
						addRowButton.setAttribute('value', addRowText);
						addRowButton.setAttribute('optionName', i);
						addRowButton.setAttribute('moduleID', moduleID);
						addRowButton.addEventListener('click', function() {
							var optionName = this.getAttribute('optionName');
							var thisTbodyName = 'tbody_' + optionName;
							var thisTbody = document.getElementById(thisTbodyName);
							var newRow = document.createElement('tr');
							var rowCount = (thisTbody.querySelectorAll('tr')) ? thisTbody.querySelectorAll('tr').length + 1 : 1;
							modules[moduleID].options[optionName].fields.forEach(function(thisOpt) {
								var newCell = document.createElement('td');
								newCell.className = 'hasTableOption';
								if (thisOpt.type !== 'enum') thisOpt.value = '';
								var optionNameWithRow = optionName + '_' + thisOpt.name + '_' + rowCount;
								var thisInput = drawOptionInput(moduleID, optionNameWithRow, thisOpt, true);
								newCell.appendChild(thisInput);
								newRow.appendChild(newCell);
								$(newRow).data('option-index', rowCount - 1);
								var firstText = newRow.querySelector('input[type=text]');
								if (!firstText) firstText = newRow.querySelector('textarea');
								if (firstText) {
									setTimeout(function() {
										firstText.focus();
									}, 200);
								}
							});

							addTableButtons(newRow);

							var thisLen = $(thisTbody).find(' > tr').length;
							$(newRow).data('itemidx-orig', thisLen);

							thisTbody.appendChild(newRow);
							$(thisTbody).trigger('change');
						}, true);

						$(addRowButton).insertAfter(thisOptionSetting);

						makeOptionTableSortable(thisTbody, moduleID, i);
					}
				} else if (thisOptions[i].type == 'builder') {
					thisOptionContainer.classList.add('specialOptionType');
					$(thisOptionDescription).insertAfter(thisLabel);
					thisOptionFormEle = drawOptionBuilder(thisOptions, moduleID, i);
				} else {
					if ((thisOptions[i].type === 'text') || (thisOptions[i].type === 'password') || (thisOptions[i].type === 'keycode')) thisOptionDescription.classList.add('textInput');
					thisOptionFormEle = drawOptionInput(moduleID, i, thisOptions[i]);
					thisOptionContainer.appendChild(thisOptionDescription);
				}
				thisOptionSetting.appendChild(thisOptionFormEle);
				allOptionsContainer.appendChild(thisOptionContainer);
			}
		}

		module.RESConfigPanelOptions.querySelector('#noOptions').style.display = 'none';
		if (!optCount && modules[moduleID].alwaysEnabled) {
			// do nothing
		} else if (optCount === 0) {
			module.RESConfigPanelOptions.querySelector('#noOptions').style.display = 'block';
		} else {
			moduleOptionsScrim = RESUtils.createElement('div', 'moduleOptionsScrim');
			moduleOptionsScrim.classList.toggle('visible', !modules[moduleID].isEnabled());
			allOptionsContainer.appendChild(moduleOptionsScrim);
			// console.log($(thisSaveButton).position());
		}

		function addTableButtons(thisTR) {
			// add delete button
			thisTD = document.createElement('td');
			var thisDeleteButton = document.createElement('div');
			$(thisDeleteButton)
				.addClass('res-icon-button res-icon deleteButton')
				.html('&#xF056;')
				.attr('title', 'remove this row');

			thisDeleteButton.addEventListener('click', function(e) {
				if (!confirm('Are you sure you want to delete this row?')) {
					e.preventDefault();
					return;
				}

				deleteOptionRow(e);
			});
			thisTD.appendChild(thisDeleteButton);
			thisTR.appendChild(thisTD);

			// add move handle
			thisTD = document.createElement('td');
			var thisHandle = document.createElement('div');
			$(thisHandle)
			.addClass('res-icon-button res-icon handle')
				.html('&#xF0AA;')
				.attr('title', 'drag and drop to move this row');

			thisTD.appendChild(thisHandle);
			$(thisTR).prepend(thisTD);
		}
	}

	module.onOptionChange = function(moduleID, fieldID, oldValue, newValue) {
		var thisOptions = getOptions(moduleID);

		if (thisOptions[fieldID] && thisOptions[fieldID].dependents) {
			thisOptions[fieldID].dependents.forEach(function(dep) {
				if (newValue) {
					showOption(moduleID, dep);
				} else {
					hideOption(moduleID, dep);
				}
			}, this);
		}
		$(RESConsoleContainer).trigger('change');
	};

	function showOption(moduleID, fieldID) {
		$('#optionContainer-'+moduleID+'-'+fieldID).slideDown();
	}

	function hideOption(moduleID, fieldID) {
		$('#optionContainer-'+moduleID+'-'+fieldID).slideUp();
	}

	function deleteOptionRow(e) {
		var thisRow = e.target.parentNode.parentNode;
		$(thisRow).trigger('change').remove();
	}

	function stageCurrentModuleOptions() {
		// Cancel debounce so we don't needlessly stage twice
		RESUtils.debounce(AUTOSTAGE_DEBOUNCE_NAME);

		var panelOptionsDiv = module.RESConfigPanelOptions;
		// first, go through inputs that aren't of a specialized type like table or builder
		$(panelOptionsDiv)
			.find('.optionContainer:not(.specialOptionType)')
			.find('input, textarea')
			.each(function(i, input) {
				// save values of any inputs onscreen, but skip ones with 'capturefor' - those are display only.
				var notTokenPrefix = (input.getAttribute('id') !== null) && (input.getAttribute('id').indexOf('token-input-') === -1);
				if ((notTokenPrefix) && (input.getAttribute('type') !== 'button') && (input.getAttribute('displayonly') !== 'true') && (input.getAttribute('tableOption') !== 'true')) {
					// get the option name out of the input field id - unless it's a radio button...
					var optionName;
					if (input.getAttribute('type') === 'radio') {
						optionName = input.getAttribute('name');
					} else {
						optionName = input.getAttribute('id');
					}
					// get the module name out of the input's moduleid attribute
					var optionValue, moduleID = currentModule;
					if (input.getAttribute('type') === 'checkbox') {
						optionValue = !!input.checked;
					} else if (input.getAttribute('type') === 'radio') {
						if (input.checked) {
							optionValue = input.value;
						}
					} else {
						// check if it's a keycode, in which case we need to parse it into an array...
						if ((input.getAttribute('class')) && (input.getAttribute('class').indexOf('keycode') !== -1)) {
							var tempArray = input.value.split(',');
							// convert the internal values of this array into their respective types (int, bool, bool, bool)
							optionValue = [parseInt(tempArray[0], 10), (tempArray[1] === 'true'), (tempArray[2] === 'true'), (tempArray[3] === 'true'), (tempArray[4] === 'true')];
						} else {
							optionValue = input.value;
						}
					}
					if (typeof optionValue !== 'undefined') {
						RESUtils.options.stage.add(moduleID, optionName, optionValue);
					}
				}
			});
		// Check if there are any tables of options on this panel...
		var optionsTables = panelOptionsDiv.querySelectorAll('.optionsTable');
		if (typeof optionsTables !== 'undefined') {
			// For each table, we need to go through each row in the tbody, and then go through each option and make a multidimensional array.
			// For example, something like: [['foo','bar','baz'],['pants','warez','cats']]
			$.each(optionsTables, function(i, table) {
				var moduleID = table.getAttribute('moduleID');
				var optionName = table.getAttribute('optionName');
				var thisTBODY = table.querySelector('tbody');
				var thisRows = thisTBODY.querySelectorAll('tr');
				// check if there are any rows...
				if (typeof thisRows !== 'undefined') {
					// go through each row, and get all of the inputs...
					var optionMulti = Array.prototype.slice.call(thisRows).map(function(row) {
						var cells = row.querySelectorAll('td.hasTableOption');
						var notAllBlank = false;
						var optionRow = Array.prototype.slice.call(cells).map(function(cell) {
							var inputs = cell.querySelectorAll('input[tableOption=true], textarea[tableOption=true]');
							var optionValue = null;
							$.each(inputs, function(i, input) {
								// get the module name out of the input's moduleid attribute
								// var moduleID = input.getAttribute('moduleID');
								if (input.getAttribute('type') === 'checkbox') {
									optionValue = input.checked;
								} else if (input.getAttribute('type') === 'radio') {
									if (input.checked) {
										optionValue = input.value;
									}
								} else {
									// check if it's a keycode, in which case we need to parse it into an array...
									if ((input.getAttribute('class')) && (input.getAttribute('class').indexOf('keycode') !== -1)) {
										var tempArray = input.value.split(',');
										// convert the internal values of this array into their respective types (int, bool, bool, bool)
										optionValue = [parseInt(tempArray[0], 10), (tempArray[1] === 'true'), (tempArray[2] === 'true'), (tempArray[3] === 'true')];
									} else {
										optionValue = input.value;
									}
								}
								if ((optionValue !== '') && (input.getAttribute('type') !== 'radio') &&
										// If no keyCode is set, then discard the value
										!(Array.isArray(optionValue) && isNaN(optionValue[0]))) {
									notAllBlank = true;
								}
							});
							return optionValue;
						});

						if (notAllBlank) {
							return optionRow;
						}
					});
					optionMulti = optionMulti.filter(function(optionRow) {
						return Array.isArray(optionRow) && (optionRow.length > 0);
					});

					if (typeof modules[moduleID].options[optionName].sort === 'function') {
						optionMulti.sort(modules[moduleID].options[optionName].sort);
					}

					RESUtils.options.stage.add(moduleID, optionName, optionMulti);
				}
			});
		}

		$(panelOptionsDiv).find('.optionBuilder').each(function(i, builder) {
			var moduleId = this.dataset.moduleId,
				optionName = this.dataset.optionName;

			var option = modules[moduleId].options[optionName],
				config = option.cases;

			var items = [];
			$(builder).find('.builderItem').each(function() {
				items.push(readBuilderItem(this, config));
			});
			RESUtils.options.stage.add(moduleId, optionName, items);
		});

		updateSaveButton();
	}

	function saveCurrentModuleOptions() {
		stageCurrentModuleOptions();
		RESUtils.options.stage.commit();
		updateSaveButton();
		notifyOptionsSaved();
	}

	function updateSaveButton(visibleOptions) {
		var unsavedOptions = RESUtils.options.stage.isDirty();

		$(saveButton).toggleClass('optionsSaved', !unsavedOptions);
	}

	module.open = function(moduleIdOrCategory) {
		var moduleID;
		if (!RESConsoleContainer) {
			create();
		}

		if (modules[moduleIdOrCategory]) {
			var mod = modules[moduleIdOrCategory];
			moduleID = mod && mod.moduleID;
		} else if (module.categories[moduleIdOrCategory]) {
			moduleID = RESUtils.options.getModuleIDsByCategory(moduleIdOrCategory)[0];
		}
		if (!moduleID || !moduleID.length) {
			moduleID = RESMetadata.defaultModuleID;
		}

		// Draw the config panel
		showConfigOptions(moduleID);

		module.isOpen = true;
		// hide the ad-frame div in case it's flash, because then it covers up the settings console and makes it impossible to see the save button!
		var adFrame = document.getElementById('ad-frame');
		if ((typeof adFrame !== 'undefined') && (adFrame !== null)) {
			adFrame.style.display = 'none';
		}
		// add a class to body to hide the scrollbar.
		setTimeout(function() {
			// Main reason for timeout: https://bugzilla.mozilla.org/show_bug.cgi?id=625289
			document.querySelector('body').classList.add('res-console-open');
		}, 500);

		modules['styleTweaks'].setSRStyleToggleVisibility(false, 'RESConsole');
		// var leftCentered = Math.floor((window.innerWidth - 720) / 2);
		// modalOverlay.setAttribute('style','display: block; height: ' + document.documentElement.scrollHeight + 'px');
		modalOverlay.classList.remove('fadeOut');
		modalOverlay.classList.add('fadeIn');

		RESConsoleContainer.classList.remove('slideOut');
		RESConsoleContainer.classList.add('slideIn');

		RESStorage.setItem('RESConsole.hasOpenedConsole', true);

		$(document.body).on('keyup', handleEscapeKey);
		$(window).on('beforeunload', handleBeforeUnload);
		$('#SearchRES-input').focus();
		$(RESConsoleContainer).on('change', RESUtils.debounce.bind(RESUtils, AUTOSTAGE_DEBOUNCE_NAME, 300, stageCurrentModuleOptions))
			.on('keyup', RESUtils.debounce.bind(RESUtils, AUTOSTAGE_DEBOUNCE_NAME, 1000, stageCurrentModuleOptions));
	};

	function handleEscapeKey(event) {
		// don't close if the user is in a token input field (e.g. adding subreddits to a list)
		// because they probably just want to cancel the dropdown list
		if (event.which === 27 && (document.activeElement.id.indexOf('token-input') === -1)) {
			module.close();
		}
	}

	function handleBeforeUnload() {
		if (RESUtils.options.stage.isDirty()) {
			return abandonChangesConfirmation;
		}
	}

	module.close = function(options) {
		options = $.extend({
			promptIfStagedOptions: true,
			resetUrl: true
		}, options);

		if (options.promptIfStagedOptions && RESUtils.options.stage.isDirty()) {
			var abandonChanges = confirm(abandonChangesConfirmation);
			if (!abandonChanges) return;
		}

		RESUtils.options.stage.reset();

		module.isOpen = false;
		$(document.body).off('keyup', handleEscapeKey);
		$(window).off('beforeunload', handleBeforeUnload);
		// Let's be nice to reddit and put their ad frame back now...
		var adFrame = document.getElementById('ad-frame');
		if ((typeof adFrame !== 'undefined') && (adFrame !== null)) {
			adFrame.style.display = 'block';
		}

		modules['styleTweaks'].setSRStyleToggleVisibility(true, 'RESConsole');

		modalOverlay.classList.remove('fadeIn');
		modalOverlay.classList.add('fadeOut');
		RESConsoleContainer.classList.remove('slideIn');
		RESConsoleContainer.classList.add('slideOut');
		setTimeout(function() {
			// Main reason for timeout: https://bugzilla.mozilla.org/show_bug.cgi?id=625289
			document.body.classList.remove('res-console-open');
		}, 500);
		// just in case the user was in the middle of setting a key and decided to close the dialog, clean that up.
		if (keyCodeModal) {
			keyCodeModal.style.display = 'none';
			captureKey = false;
		}

		if (options.resetUrl) {
			modules['settingsNavigation'].resetUrlHash();
		}
	};

	function openCategoryPanel(categories) {
		var items = $(RESConsoleContainer).find('#RESConfigPanelModulesList .RESConfigPanelCategory'),
			selected = items.filter(function() {
				var thisValue = $(this).data('category');

				return categories.indexOf(thisValue) !== -1;
			});
		if (selected.filter('.active').length === 0) { // if a category isn't already open
			selected = selected.filter(function() { // select first category
				var thisValue = $(this).data('category');
				return categories.indexOf(thisValue) === 0;
			});

			items.not(selected).removeClass('active').find('ul').slideUp(300);
			selected.addClass('active').find('ul').slideDown(300);
		}
	}

	function updateAdvancedOptionsVisibility() {
		if (modules['settingsNavigation'].options.showAllOptions.value) {
			document.getElementById('RESConsoleContent').classList.remove('advanced-options-disabled');
		} else {
			document.getElementById('RESConsoleContent').classList.add('advanced-options-disabled');
		}
	}

	module.getOptionValue = function(moduleID, optionKey) {
		var optionInput = document.getElementById(optionKey);
		if (optionInput) {
			return optionInput.value;
		} else {
			console.error('Cannot get a value for ' + moduleID + '.' + optionKey +
				' because the HTML element does not exist.');
			return null;
		}
	};

	module.setOptionValue = function(moduleID, optionKey, value) {
		var optionInput = document.getElementById(optionKey);
		if (optionInput) {
			optionInput.value = value;
		} else {
			console.error('Cannot set a value for ' + moduleID + '.' + optionKey +
				' because the HTML element does not exist.');
		}
	};

	function makeOptionTableSortable(tableBody, moduleID, optionKey) {
		function cleanupDrag($item) {
			$item.removeData(['oldIndex', 'dragOffset']);
			$(module.RESConfigPanelOptions).edgescroll('stop');
			$item.find('>td').removeAttr('style');
		}
		$(tableBody).sortable({
			nested: false,
			handle: '.handle',
			placeholderClass: 'RESSortPlaceholder',
			placeholder: '<tr class="RESSortPlaceholder"><td></td></tr>',
			containerSelector: 'tbody',
			itemSelector: 'tr',
			onCancel: function($item, container, _super, event) {
				_super($item, container, _super, event);
				cleanupDrag($item);
			},
			onDrop: function($item, container, _super, event) {
				_super($item, container, _super, event);

				var oldIndex = $item.data('oldIndex'),
					newIndex = $item.index(),
					rows = modules[moduleID].options[optionKey].value,
					row = rows.splice(oldIndex, 1)[0];

				rows.splice(newIndex, 0, row);

				cleanupDrag($item);
				$item.trigger('change');
			},
			onDrag: function($item, position, _super, event) {
				var dragOffset = $item.data('dragOffset');
				//Reposition the row, remembering to apply the offset
				$item.css({
					top: position.top - dragOffset.top,
					left: position.left - dragOffset.left
				});
			},
			onDragStart: function($item, container, _super, event) {
				_super($item, container, _super, event);

				$(module.RESConfigPanelOptions).edgescroll({speed: 4});

				var offset = $item.offset(),
					pointer = container.rootGroup.pointer;

				//force a constant width for the columns since switching the
				// row's positioning method to absolute means that the column
				// width calulation ignores the other rows.
				$item.find('>td').css('width', function() {
					return $(this).width();
				});
				$item.css({
					position: 'absolute',
					height: $item.height(),
					width: $item.width()
				}).data({
					oldIndex: $item.index(),
					// Store this so we can keep what we are dragging at
					// the same relative cursor position
					dragOffset: {
						left: pointer.left - offset.left,
						top: pointer.top - offset.top
					}
				});
			}
		});
	}

	//Builder stuff

	function drawOptionBuilder(options, moduleID, optionName) {
		var option = options[optionName];
		var $addRowButton = $('<button class="addRowButton">'),
			$itemContainer = $('<div class="optionBuilder">');

		$itemContainer.attr({
			'data-module-id': moduleID,
			'data-option-name': optionName
		});
		$addRowButton
			.text(option.addItemText || '+add item')
			.on('click', function(e) {
				var $newBody = drawBuilderItem(option.defaultTemplate(), option.cases);
				$(this).siblings('.optionBuilder:first').trigger('change').append($newBody);
				var firstText = $newBody.find('input[type=text], textarea')[0];
				if (firstText) {
					setTimeout(function() {
						firstText.focus();
					}, 200);
				}
			});
		option.value.forEach(function(item) {
			drawBuilderItem(item, option.cases).appendTo($itemContainer);
		});
		makeBuilderItemsSortable($itemContainer);

		return $('<div>').append($itemContainer, $addRowButton)[0];
	}

	function drawBuilderItem(data, config) {
		var $body = $('<div class="builderItem">'),
			$header = $('<textarea name="builderNote" rows="2" cols="40" placeholder="Write a description/note for this">').val(data.note),
			$versionField  = $('<input type="hidden" name="version">').val(data.ver),
			$wrapper = $('<div class="builderBody">');

		var $handle = $('<div>')
			.addClass('res-icon-button res-icon handle')
			.html('&#xF0AA;')
			.attr('title', 'drag and drop to move this filter');

		var $deleteButton = $('<div>')
			.addClass('res-icon-button res-icon deleteButton')
			.html('&#xF056;')
			.attr('title', 'remove this filter')
			.on('click', function(e) {
				if (confirm('Are you sure you want remove this filter?')) {
					$(this).trigger('change');
					$(this).closest('.builderItem').trigger('change').remove();
				}
			});

		var $editButton = $('<div>')
			.addClass('res-icon-button res-icon')
			.html('&#xF061;')
			.attr('title', 'copy and share, or update your settings with a new version')
			.on('click', function(e) {
				var data = readBuilderItem($(this).closest('.builderItem'), config),
					json = prompt(
						'Copy this and share it, or paste a new version and update your settings',
						JSON.stringify(data)
					);
				if (json !== null) {
					var newData = JSON.parse(json);
					$body.trigger('change').replaceWith(drawBuilderItem(newData, config));
				}
			});

		$body.append([
			$('<div class="builderItemControls">').append($handle),
			$('<div class="builderItemControls builderTrailingControls">').append($editButton, $deleteButton),
			$header,
			$versionField,
			$wrapper
		]);
		$wrapper.append(drawBuilderBlock(data.body, config));
		$wrapper.find('> .builderWrap > .builderControls').remove();
		makeBuilderBlocksSortable($wrapper);
		return $body;
	}

	function drawBlockControls() {
		var $handle = $('<div>')
			.addClass('res-icon-button res-icon handle')
			.html('&#xF0AA;')
			.attr('title', 'drag and drop to move this condition');

		return $('<div class="builderControls">').append($handle);
	}

	function drawBlockTrailingControls() {
		var $deleteButton = $('<div>')
			.addClass('res-icon-button res-icon deleteButton')
			.html('&#xF056;')
			.attr('title', 'remove this condition');
		$deleteButton.on('click', function(e) {
			if (confirm('Are you sure you want to delete this condition?')) {
				$(this).trigger('change');
				$(this).closest('.builderWrap').parent('li').remove();
			}
		});
		return $('<div class="builderControls builderTrailingControls">').append($deleteButton);
	}

	function drawBuilderBlock(data, config, tag) {
		var $wrapper = $('<div class="builderWrap">'),
			$controls = drawBlockControls(),
			$trailingControls = drawBlockTrailingControls(),
			$block = $('<div class="builderBlock">');
		$wrapper.append($trailingControls, $controls, $block);
		$block.attr('data-type', data.type);

		var blockConfig = config[data.type];

		blockConfig.fields.forEach(function(field) {
			if (typeof field === 'string') return $block.append(field);

			var fieldModule = builderFields[field.type];
			if (fieldModule === undefined)
				throw new Error('Unimplemented field type: ' + field.type);
			$block.append(fieldModule.draw(data, field, config));
		});
		return $wrapper;
	}

	function readBuilderItem(item, config) {
		var obj = {
			note: $(item).find('> textarea[name=builderNote]').val(),
			ver: parseInt($(item).find('> input[name=version]').val(), 10)
		};
		var $firstBlock = $(item).find('> .builderBody > .builderWrap > .builderBlock');
		obj.body = readBuilderBlock($firstBlock, config);
		return obj;
	}

	function readBuilderBlock($element, config) {
		var type = $element.attr('data-type'),
			blockConfig = config[type];
		var data = {type: type};
		blockConfig.fields.forEach(function(field) {
			if (typeof field === 'string') return;
			var fieldType = field.type;
			var $fieldElem = $element.find('> [name='+field.id+']');
			if (typeof builderFields[fieldType].read === 'function') {
				data[field.id] = builderFields[fieldType].read($fieldElem, field, config);
			} else {
				data[field.id] = $fieldElem.val();
			}
		});
		return data;
	}

	function makeBuilderItemsSortable($builder) {
		function cleanupDrag($item) {
			$item.removeData('dragOffset');
			$(module.RESConfigPanelOptions).edgescroll('stop');
		}

		$builder.sortable({
			nested: false,
			handle: '.builderItem > .builderItemControls .handle',
			placeholderClass: 'RESSortPlaceholder',
			placeholder: '<div class="RESSortPlaceholder"></div>',
			containerSelector: '.optionBuilder',
			itemSelector: '.builderItem',
			onCancel: function($item, container, _super, event) {
				_super($item, container, _super, event);
				cleanupDrag($item);
			},
			onDrop: function($item, container, _super, event) {
				_super($item, container, _super, event);
				cleanupDrag($item);
				$item.trigger('change');
			},
			onDrag: function($item, position, _super, event) {
				var dragOffset = $item.data('dragOffset');
				//Reposition the row, remembering to apply the offset
				$item.css({
					top: position.top - dragOffset.top,
					left: position.left - dragOffset.left
				});
			},
			onDragStart: function($item, container, _super, event) {
				_super($item, container, _super, event);

				$(module.RESConfigPanelOptions).edgescroll({speed: 4});

				$item.css({
					position: 'absolute',
					height: $item.height(),
					width: $item.width()
				});
				// Store this so we can keep what we are dragging at
				// the same relative cursor position
				var offset = $item.offset(),
					pointer = container.rootGroup.pointer;
				$item.data('dragOffset', {
					left: pointer.left - offset.left,
					top: pointer.top - offset.top
				});
			}
		});
	}

	function makeBuilderBlocksSortable($builderItem) {
		function cleanupDrag($item) {
			$item.removeData('dragOffset');
			$(module.RESConfigPanelOptions).edgescroll('stop');
		}

		$builderItem.children('.builderWrap').sortable({
			nested: true,
			handle: '.handle',
			placeholderClass: 'RESSortPlaceholder',
			placeholder: '<li class="RESSortPlaceholder"></li>',
			containerSelector: '.builderWrap',
			itemPath: '> .builderBlock > .builderMulti',
			itemSelector: 'li',
			onCancel: function($item, container, _super, event) {
				_super($item, container, _super, event);
				cleanupDrag($item);
			},
			onDrop: function($item, container, _super, event) {
				_super($item, container, _super, event);
				cleanupDrag($item);
				$item.trigger('change');
			},
			onDrag: function($item, position, _super, event) {
				var dragOffset = $item.data('dragOffset');
				//Reposition the row, remembering to apply the offset
				$item.css({
					top: position.top - dragOffset.top,
					left: position.left - dragOffset.left
				});
			},
			onDragStart: function($item, container, _super, event) {
				_super($item, container, _super, event);

				$(module.RESConfigPanelOptions).edgescroll({speed: 4});

				$item.css({
					position: 'absolute',
					height: $item.height(),
					width: $item.width()
				});
				// Store this so we can keep what we are dragging at
				// the same relative cursor position
				var offset = $item.offset(),
					pointer = container.rootGroup.pointer;
				$item.data('dragOffset', {
					left: pointer.left - offset.left,
					top: pointer.top - offset.top
				});
			}
		});
	}

	module.numericalCompare = function(op, a, b) {
		switch (op) {
			case '==':	return a == b;
			case '!=':	return a != b;
			case '>':	return a > b;
			case '<':	return a < b;
			case '>=':	return a >= b;
			case '<=':	return a <= b;
			default: throw new Error('Unhandled operator ' + op);
		}
	};

	var builderFields = {
		multi: {
			draw: function(data, blockConfig, config) {
				var $rowWrapper = $('<ul class="builderMulti">').attr('name', blockConfig.id),
					items = data[blockConfig.id];
				items.forEach(function(itemData) {
					drawBuilderBlock(itemData, config).appendTo($rowWrapper).wrap('<li>');
				});

				var $addButton = $('<select class="addBuilderBlock">');
				$addButton.append('<option value="">+ add a condition</option>');
				var addableKeys = blockConfig.include;
				if (addableKeys === 'all') addableKeys = Object.keys(config);
				addableKeys.forEach(function(key) {
					var name = config[key].name || key;
					$('<option>').text(name).val(key).appendTo($addButton);
				});
				$addButton.on('change', function(e) {
					var type = $(this).val();
					if (type !== '' && type in config) {
						var newRowData = config[type].defaultTemplate();
						var $newRow = drawBuilderBlock(newRowData, config);
						$rowWrapper.append($newRow);
						$newRow.wrap('<li>');
						$(this).val('');

						var firstText = $newRow.find('input[type=text], input[type=number], textarea')[0];
						if (firstText) {
							setTimeout(function() {
								firstText.focus();
							}, 200);
						}
					}
				});

				return $rowWrapper.add($addButton);
			},
			read: function($elem, fieldConfig, config) {
				return $elem.find('> li > .builderWrap > .builderBlock').map(function() {
					return readBuilderBlock($(this), config);
				}).get();
			}
		},
		number: {
			draw: function(data, blockConfig, config) {
				var id = blockConfig.id;
				return $('<input type="number">').attr('name', id).val(data[id]);
			}
		},
		check: {
			draw: function(data, blockConfig, config) {
				var id = blockConfig.id;
				return $('<input type="checkbox">').attr('name', id).val(data[id]);
			}
		},
		checkset: {
			uid: 0,
			draw: function(data, blockConfig, config) {
				var id = blockConfig.id;
				var prefixId = this.uid++;
				var $wrap = $('<div class="checkset">').attr('name', blockConfig.id);
				blockConfig.items.forEach(function(e, idx, a) {
					var itemId = 'checkset-'+prefixId+'-'+idx + 'X';
					var $box = $('<input type="checkbox" />')
						.attr('id', itemId)
						.attr('name', e);
					if (id in data && data[id].indexOf(e) > -1) $box.prop('checked', true);
					var $label = $('<label>')
						.attr('for', itemId)
						.text(e);
					$wrap.append($box, $label);
				});
				return $wrap;
			},
			read: function($elem, fieldConfig, config) {
				var found = fieldConfig.items.filter(function(e, i, a) {
					return $elem.children('[name="'+e+'"]').prop('checked');
				});
				return found;
			}
		},
		text: {
			draw: function(data, blockConfig, config) {
				var id = blockConfig.id;
				var $field = $('<input type="text">')
					.attr('name', id)
					.val(data[id]);
				if ('pattern' in blockConfig) {
					$field.attr('pattern', blockConfig.pattern);
				}
				if ('placeholder' in blockConfig) {
					$field.attr('placeholder', blockConfig.placeholder);
				}
				if ('validator' in blockConfig) {
					$field.on('input', function(e) {
						try {
							blockConfig.validator(this.value);
							this.setCustomValidity('');
						} catch (ex) {
							this.setCustomValidity('invalid');
						}
					});
				}
				return $field;
			}
		},
		duration: {
			draw: function(data, blockConfig, config) {
				//Store as milliseconds like JavaScript Date
				var durr = data[blockConfig.id];
				var days, hours, minutes;
				durr /= 60 * 1000;
				minutes = durr % 60;
				durr = (durr - minutes) / 60;
				hours = durr % 24;
				durr = (durr - hours) / 24;
				days = durr;

				return $('<div class="durationField">')
					.attr('name', blockConfig.id)
					.append([
						$('<input type="number" name="days" />').val(days), ' days ',
						$('<input type="number" name="hours" />').val(hours), 'hours ',
						$('<input type="number" name="minutes" />').val(minutes), ' minutes ',
					]);
			},
			read: function($elem, fieldConfig, config) {
				var days    = parseFloat($elem.children('[name=days]')   .val()) || 0,
					hours   = parseFloat($elem.children('[name=hours]')  .val()) || 0,
					minutes = parseFloat($elem.children('[name=minutes]').val()) || 0;

				// Store as milliseconds like JavaScript Date
				var duration = 0;
				duration += days    * 24 * 60 * 60;
				duration += hours        * 60 * 60;
				duration += minutes           * 60;
				duration *= 1000;

				return duration;
			}
		},
		select: {
			draw: function(data, blockConfig, config) {
				var value = data[blockConfig.id],
					entries = blockConfig.options;

				if (typeof entries === 'string')
					entries = this.getPredefinedChoices(entries);

				var $dropdown = $('<select>').attr('name', blockConfig.id);
				entries.forEach(function(row) {
					var label, value;
					if (typeof row === 'string') {
						label = value = row;
					} else {
						label = row[0];
						value = row[1];
					}
					$('<option>').text(label).val(value).appendTo($dropdown);
				});
				$dropdown.val(value);
				return $dropdown;
			},
			getPredefinedChoices: function(name) {
				if (name === 'COMPARISON') {
					return [
						['exactly', '=='],
						['not', '!='],
						['more than', '>'],
						['less than', '<'],
						['at least', '>='],
						['at most', '<='],
					];
				} else {
					throw new Error('Option set "'+name+'" is not defined');
				}
			}
		}
	};
	//End Builder Stuff

	function getOptions(moduleID) {
		var stored = RESUtils.options.getOptions(moduleID);
		var staged = RESUtils.options.stage.get(moduleID);

		var merged = $.extend(true, {}, stored, staged);
		var dependency;
		for (var optionKey in merged) {
			if (!merged.hasOwnProperty(optionKey)) continue;

			dependency = merged[merged[optionKey].dependsOn];
			if (dependency) {
				// we'll store a list of dependents on the 'parent' so we can show/hide them on
				// the fly as necessary
				dependency.dependents = dependency.dependents || [];
				dependency.dependents.push(optionKey);
			}
		}
		return merged;
	}

	var abandonChangesConfirmation = 'Abandon your changes to RES settings?';

	function notifyOptionsSaved() {
		var statusEle = RESConsoleContainer.querySelector('#moduleOptionsSaveStatus');
		if (statusEle) {
			statusEle.setAttribute('style', 'display: block; opacity: 1');
			setTimeout(RESUtils.fadeElementOut, 500, statusEle, 1.0);
		}
	}
});
