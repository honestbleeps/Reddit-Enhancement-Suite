addModule('settingsConsole', function(module, moduleID) {
	module.moduleName = 'Settings Console';
	module.category = 'About RES';
	module.description = 'Manage your RES settings and preferences';
	module.alwaysEnabled = true;
	module.hidden = true;

	var RESConsole = module; // alias for now

	$.extend(module, {
		modalOverlay: '',
		RESConsoleContainer: '',
		RESConfigPanelOptions: null
	});

	$.extend(module, {
		beforeLoad: function() {
			this.renderMenuItem();
		},
		go: function() {
			this.addMenuItem();
		},
		renderMenuItem: function() {
			this.menuItem = RESUtils.createElementWithID('div', 'SettingsConsole', null, 'RES settings console');
		},
		addMenuItem: function() {
			function onClick() {
				modules['RESMenu'].hidePrefsDropdown();
				modules['settingsConsole'].open();
			}
			modules['RESMenu'].addMenuItem(this.menuItem, onClick, true);
		},
		create: function() {
			module.populateCategories();
			RESTemplates.load('settingsConsole', module._create.bind(module));
		},
		_create: function(template) {
			var logoImg, header1, RESConsoleHeader, RESConsoleTopBar;

			// create the console container
			this.RESConsoleContainer = template.html()[0];
			// hide it by default...
			// this.RESConsoleContainer.style.display = 'none';
			// create a modal overlay
			this.modalOverlay = RESUtils.createElementWithID('div', 'modalOverlay');
			this.modalOverlay.addEventListener('click', function(e) {
				e.preventDefault();
				return false;
			}, true);
			document.body.appendChild(this.modalOverlay);

			this.RESConsoleContainer.querySelector('#RESConsoleVersionDisplay').textContent = RESVersion;

			var RESClose = this.RESConsoleContainer.querySelector('#RESClose');
			RESClose.addEventListener('click', function(e) {
				e.preventDefault();
				RESConsole.close();
			}, true);


			var RESAdvOptionsSpan = this.RESConsoleContainer.querySelector('#RESAllOptionsSpan');
			RESAdvOptionsSpan.setAttribute('title', modules['settingsNavigation'].options.showAllOptions.description);

			var RESAdvOptions = RESAdvOptionsSpan.querySelector('input');
			RESAdvOptions.addEventListener('change', function(e) {
				RESUtils.options.setOption('settingsNavigation', 'showAllOptions', this.checked);
				RESConsole.updateAdvancedOptionsVisibility();
			}, true);

			// create the menu
			RESTemplates.load('settingsConsoleModuleSelector', function(template) {
				var modulesSelector = template.html({ categories: module.categories });
				$(module.RESConsoleContainer).find('#RESConfigPanelModulesList').html(modulesSelector);
			});

			$(module.RESConsoleContainer).find('#RESConfigPanelModulesPane')
				.on('click', '.moduleButton', function(e) {
					var id = $(this).data('module');
					if (id) {
						e.preventDefault();
						module.showConfigOptions(id);
					}
				})
				.on('click', '.categoryButton', function(e) {
					var id = $(this).data('category');
					if (id) {
						e.preventDefault();
						module.openCategoryPanel(id);
					}
				})

			this.RESConsoleContent = this.RESConsoleContainer.querySelector('#RESConsoleContent');
			if (modules['settingsNavigation'].options.showAllOptions.value) {
				RESAdvOptions.checked = true;
			} else {
				this.RESConsoleContent.classList.add('advanced-options-disabled');
			}
			this.RESConfigPanelOptions = this.RESConsoleContainer.querySelector('#RESConfigPanelOptions');

			modules['search'].renderSearchForm(this.RESConsoleContainer);

			// Okay, the console is done. Add it to the document body.
			document.body.appendChild(this.RESConsoleContainer);

			window.addEventListener('keydown', function(e) {
				if ((RESConsole.captureKey) && (e.keyCode !== 16) && (e.keyCode !== 17) && (e.keyCode !== 18)) {
					// capture the key, display something nice for it, and then close the popup...
					e.preventDefault();
					var keyArray;
					if (e.keyCode === 8) { // backspace, we disable the shortcut
						keyArray = [-1, false, false, false, false];
					} else {
						keyArray = [e.keyCode, e.altKey, e.ctrlKey, e.shiftKey, e.metaKey];
					}
					// not using .getElementById here due to a collision with reddit's elements (i.e. #modmail)
					RESConsole.RESConfigPanelOptions.querySelector('[id="' + RESConsole.captureKeyID + '"]').value = keyArray.join(',');
					RESConsole.RESConfigPanelOptions.querySelector('[id="' + RESConsole.captureKeyID + '-display"]').value = RESUtils.niceKeyCode(keyArray);
					RESConsole.keyCodeModal.style.display = 'none';
					RESConsole.captureKey = false;
				}
			});

			$(this.RESConsoleContent).on({
				focus: function(e) {
					// show dialog box to grab keycode, but display something nice...
					$(RESConsole.keyCodeModal).css({
						display: 'block',
						top: RESUtils.mouseY + 'px',
						left: RESUtils.mouseX + 'px'
					});
					// RESConsole.keyCodeModal.style.display = 'block';
					RESConsole.captureKey = true;
					RESConsole.captureKeyID = this.getAttribute('capturefor');
				},
				blur: function(e) {
					$(RESConsole.keyCodeModal).css('display', 'none');
				}
			}, '.keycode + input[type=text][displayonly]');

			this.keyCodeModal = RESUtils.createElementWithID('div', 'keyCodeModal');
			$(this.keyCodeModal).text('Press a key (or combination with shift, alt and/or ctrl) to assign this action.');
			document.body.appendChild(this.keyCodeModal);
		},
		populateCategories: function() {
			var categories = [];
			var modulesByCategory = {};

			for (var moduleID in modules) {
				var module = modules[moduleID];
				if (module.hidden) continue;

				var moduleCategories = [].concat(module.category);
				moduleCategories.forEach(function(category) {
					if (category && !modulesByCategory[category]) {
						categories.push(category);
						modulesByCategory[category] = [];
					}
					modulesByCategory[category].push({
						moduleID: module.moduleID,
						moduleName: module.moduleName,
						isEnabled: module.isEnabled(),
						sort: module.sort
					});
				});
			}

			categories = categories.map(function(category) {
				return {
					name: category,
					modules: modulesByCategory[category]
				};
			});
			categories.sort(function(a, b) {
				if (a.name === 'About RES') return 1;
				if (b.name === 'About RES') return -1;
				return a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase());
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

			this.categories = categories;
		},
		updateSelectedModule: function(moduleID) {
			var items = $(RESConsole.RESConsoleContainer).find('.moduleButton');

			var selected = items.filter(function() {
				var thisValue = $(this).data('module');

				return thisValue === moduleID;
			})
			items.not(selected).removeClass('active');
			selected.addClass('active');

			var category = (category = modules[moduleID]) && category.category;
			this.openCategoryPanel(category);
		},
		drawOptionInput: function(moduleID, optionName, optionObject, isTable) {
			var thisOptionFormEle;
			switch (optionObject.type) {
				case 'textarea':
					// textarea...
					thisOptionFormEle = RESUtils.createElementWithID('textarea', optionName);
					thisOptionFormEle.setAttribute('type', 'textarea');
					thisOptionFormEle.setAttribute('moduleID', moduleID);
					// this is typed user input and therefore safe, we allow HTML for a few settings.
					$(thisOptionFormEle).html(escapeHTML(optionObject.value));
					break;
				case 'text':
					// text...
					thisOptionFormEle = RESUtils.createElementWithID('input', optionName);
					thisOptionFormEle.setAttribute('type', 'text');
					thisOptionFormEle.setAttribute('moduleID', moduleID);
					thisOptionFormEle.setAttribute('placeHolder', optionObject.placeHolder || '');
					thisOptionFormEle.setAttribute('value', optionObject.value);
					break;
				case 'color':
					// color...
					thisOptionFormEle = RESUtils.createElementWithID('input', optionName);
					thisOptionFormEle.setAttribute('type', 'color');
					thisOptionFormEle.setAttribute('moduleID', moduleID);
					// thisOptionFormEle.setAttribute('value', optionObject.value); // didn't work on chrome, need to work with .value
					thisOptionFormEle.value = optionObject.value;
					break;
				case 'button':
					// button...
					thisOptionFormEle = RESUtils.createElementWithID('button', optionName);
					thisOptionFormEle.classList.add('RESConsoleButton');
					thisOptionFormEle.setAttribute('moduleID', moduleID);
					thisOptionFormEle.textContent = optionObject.text;
					thisOptionFormEle.addEventListener('click', optionObject.callback, false);
					break;
				case 'list':
					// list...
					thisOptionFormEle = RESUtils.createElementWithID('input', optionName);
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
					thisOptionFormEle = RESUtils.createElementWithID('input', optionName);
					thisOptionFormEle.setAttribute('type', 'password');
					thisOptionFormEle.setAttribute('moduleID', moduleID);
					thisOptionFormEle.setAttribute('value', optionObject.value);
					break;
				case 'boolean':
					// checkbox
					/*
					var thisOptionFormEle = RESUtils.createElementWithID('input', optionName);
					thisOptionFormEle.setAttribute('type','checkbox');
					thisOptionFormEle.setAttribute('moduleID',moduleID);
					thisOptionFormEle.setAttribute('value',optionObject.value);
					if (optionObject.value) {
						thisOptionFormEle.setAttribute('checked',true);
					}
					*/
					thisOptionFormEle = RESUtils.toggleButton(moduleID, optionName, optionObject.value, null, null, isTable);
					break;
				case 'enum':
					// radio buttons
					if (typeof optionObject.values === 'undefined') {
						alert('misconfigured enum option in module: ' + moduleID);
					} else {
						thisOptionFormEle = RESUtils.createElementWithID('div', optionName);
						thisOptionFormEle.setAttribute('class', 'enum');
						optionObject.values.forEach(function(optionValue, index) {
							var thisId = optionName + '-' + index;
							var thisOptionFormSubEle = RESUtils.createElementWithID('input', thisId);
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
		},
		showConfigOptions: function(moduleID) {
			if (!modules[moduleID]) return;
			RESConsole.drawConfigOptions(moduleID);
			RESConsole.updateSelectedModule(moduleID);
			RESConsole.currentModule = moduleID;

			RESConsole.RESConsoleContent.scrollTop = 0;

			modules['settingsNavigation'].setUrlHash(moduleID);
		},
		drawConfigOptions: function(moduleID) {
			if (modules[moduleID] && modules[moduleID].hidden) return;
			var thisOptions = getOptions(moduleID),
				optCount = 0,
				moduleNameSpan = RESUtils.createElementWithID('span', null, 'moduleName', modules[moduleID].moduleName),
				toggleOn = RESUtils.createElementWithID('span', null, 'toggleOn noCtrlF', 'on'),
				toggleOff = RESUtils.createElementWithID('span', null, 'toggleOff noCtrlF', 'off'),
				thisHeader,
				thisToggle, thisDescription, allOptionsContainer,
				thisOptionContainer, containerID, thisLabel,
				thisSaveButton,
				thisOptionFormEle,
				i, dep;

			// put in the description, and a button to enable/disable the module, first..
			thisHeader = RESConsole.RESConsoleContainer.querySelector('.moduleHeader');
			RESConsole.RESConsoleContainer.querySelector('.moduleName').textContent = modules[moduleID].moduleName;

			thisToggle = RESConsole.RESConsoleContainer.querySelector('.moduleToggle');


			$(thisToggle)
				.toggle(!modules[moduleID].alwaysEnabled)
				.toggleClass('enabled', modules[moduleID].isEnabled())
				.data('module', moduleID);

			thisToggle.addEventListener('click', function(e) {
				var moduleID = $(this).data('module'),
					$moduleButton = $(RESConsole.RESConsoleContainer).find('.moduleButton').filter(function() {
						return $(this).data('module') === moduleID;
					}),
					enabled = this.classList.contains('enabled');

				var enable = !enabled;
				$(thisToggle).add($moduleButton).add(this.classList)
					.toggleClass('enabled', enable);
				$('#moduleOptionsSave').toggle(enable);
				$(RESConsole.moduleOptionsScrim)
					.toggleClass('visible', !enable);

				RESUtils.options.enableModule(moduleID, !enabled);
			}, true);

			function saveModuleOptions(e) {
				e.preventDefault();
				RESConsole.saveCurrentModuleOptions();
			}

			thisSaveButton = module.RESConsoleContainer.querySelector('#moduleOptionsSave');
			thisSaveButton.addEventListener('click', saveModuleOptions, true);
			$(thisSaveButton).toggle(Object.getOwnPropertyNames(thisOptions).length > 0);

			thisDescription = module.RESConsoleContainer.querySelector('.moduleDescription');

			// TODO: potentially use markdown instead of HTML for descriptions and convert on the
			// fly with SnuOwnd. Using .html() is safe here because we control each module's
			// description field, but for future code review sanity we should consider updating.
			if (typeof modules[moduleID].onConsoleOpen === 'function') {
				modules[moduleID].onConsoleOpen();
			}
			$(thisDescription).html(modules[moduleID].description);

			allOptionsContainer = module.RESConsoleContainer.querySelector('#allOptionsContainer');
			$(allOptionsContainer).empty();
			// now draw all the options...
			for (i in thisOptions) {
				if (!thisOptions[i].noconfig) {
					optCount++;
					containerID = 'optionContainer-' + moduleID + '-' + i;
					thisOptionContainer = RESUtils.createElementWithID('div', containerID, 'optionContainer');
					dep = thisOptions[i].dependsOn;
					if (dep) {
						// we'll store a list of dependents on the 'parent' so we can show/hide them on
						// the fly as necessary
						if (! thisOptions[dep].dependents) {
							thisOptions[dep].dependents = [];
						}
						// add this option to that list.
						thisOptions[dep].dependents.push(i);
						// if the option this one depends on is false, hide it
						if (!thisOptions[dep].value) {
							thisOptionContainer.setAttribute('style', 'display: none;');
						}
					}

					if (thisOptions[i].advanced) {
						thisOptionContainer.classList.add('advanced');
					}
					thisLabel = document.createElement('label');
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
							if (thisOptions[i].default.substr(0,1) === '#') {
								niceDefaultOption += ' (R:' + parseInt(thisOptions[i].default.substr(1,2),16) + ', G:' + parseInt(thisOptions[i].default.substr(3,2),16) + ', B:' + parseInt(thisOptions[i].default.substr(5,2),16) + ')';
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
								return false;
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
					var thisOptionDescription = RESUtils.createElementWithID('div', null, 'optionDescription');
					// TODO: same as above in this function, let's use markdown in the future
					$(thisOptionDescription).html(thisOptions[i].description);
					thisOptionContainer.appendChild(thisLabel);
					if (thisOptions[i].type === 'table') {
						var isFixed = thisOptions[i].addRowText === false; // set addRowText value to false to disable additing/removing/moving of row
						thisOptionDescription.classList.add('table');
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
								thisTableHeader.appendChild(thisTH);
							}
							thisThead.appendChild(thisTableHeader);
							thisTable.appendChild(thisThead);
							var thisTbody = document.createElement('tbody'),
								thisTR, thisTD;
							thisTbody.setAttribute('id', 'tbody_' + i);
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
										var thisTableEle = this.drawOptionInput(moduleID, thisOptInputName, thisOpt, true);
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
						thisOptionContainer.appendChild(thisOptionDescription);
						thisOptionContainer.appendChild(thisOptionFormEle);
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
									var thisInput = RESConsole.drawOptionInput(moduleID, optionNameWithRow, thisOpt, true);
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
							}, true);
							thisOptionContainer.appendChild(addRowButton);


							RESConsole.makeOptionTableSortable(thisTbody, moduleID, i);
						}
					} else {
						if ((thisOptions[i].type === 'text') || (thisOptions[i].type === 'password') || (thisOptions[i].type === 'keycode')) thisOptionDescription.classList.add('textInput');
						thisOptionFormEle = this.drawOptionInput(moduleID, i, thisOptions[i]);
						thisOptionContainer.appendChild(thisOptionFormEle);
						thisOptionContainer.appendChild(thisOptionDescription);
					}
					var thisClear = document.createElement('div');
					thisClear.setAttribute('class', 'clear');
					thisOptionContainer.appendChild(thisClear);
					allOptionsContainer.appendChild(thisOptionContainer);
				}
			}

			if (!optCount && modules[moduleID].alwaysEnabled) {
				// do nothing
			} else if (optCount === 0) {
				var noOptions = RESUtils.createElementWithID('div', 'noOptions');
				noOptions.classList.add('optionContainer');
				$(noOptions).text('There are no configurable options for this module.');
				this.RESConfigPanelOptions.appendChild(noOptions);
			} else {
				// var thisSaveStatusBottom = RESUtils.createElementWithID('div','moduleOptionsSaveStatusBottom','saveStatus');
				// this.RESConfigPanelOptions.appendChild(thisBottomSaveButton);
				// this.RESConfigPanelOptions.appendChild(thisSaveStatusBottom);
				this.moduleOptionsScrim = RESUtils.createElementWithID('div', 'moduleOptionsScrim');
				if (modules[moduleID].isEnabled()) {
					RESConsole.moduleOptionsScrim.classList.remove('visible');
					$('#moduleOptionsSave').fadeIn();
				} else {
					RESConsole.moduleOptionsScrim.classList.add('visible');
					$('#moduleOptionsSave').fadeOut();
				}
				allOptionsContainer.appendChild(this.moduleOptionsScrim);
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
					if (!confirm("Are you sure you want to delete this row?")) {
						e.preventDefault();
						return;
					}

					RESConsole.deleteOptionRow(e);
				});
				thisTD.appendChild(thisDeleteButton);
				thisTR.appendChild(thisTD);

				// add move handle
				thisTD = document.createElement('td');
				var thisHandle = document.createElement('div');
				$(thisHandle)
				.addClass('res-icon-button res-icon handle')
					.html('&#xF0AA;')
					.attr('title', 'drag and drop to move this row')

				thisTD.appendChild(thisHandle);
				thisTR.appendChild(thisTD);
			}
		},
		onOptionChange: function(moduleID, fieldID, oldValue, newValue) {
			var thisOptions = getOptions(moduleID);

			if (thisOptions[fieldID] && thisOptions[fieldID].dependents) {
				thisOptions[fieldID].dependents.forEach(function(dep) {
					if (newValue) {
						this.showOption(moduleID, dep);
					} else {
						this.hideOption(moduleID, dep);
					}
				}, this);
			}
		},
		showOption: function(moduleID, fieldID) {
			$('#optionContainer-'+moduleID+'-'+fieldID).slideDown();
		},
		hideOption: function(moduleID, fieldID) {
			$('#optionContainer-'+moduleID+'-'+fieldID).slideUp();
		},
		deleteOptionRow: function(e) {
			var thisRow = e.target.parentNode.parentNode;
			$(thisRow).remove();
		},
		stageCurrentModuleOptions: function() {
			var panelOptionsDiv = this.RESConfigPanelOptions;
			// first, go through inputs that aren't a part of a "table of options"...
			var inputs = panelOptionsDiv.querySelectorAll('input, textarea');
			$.each(inputs, function(i, input) {
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
					var optionValue, moduleID = RESConsole.currentModule;
					if (input.getAttribute('type') === 'checkbox') {
						optionValue = !! input.checked;
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
						stageOption(moduleID, optionName, optionValue);
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

						stageOption(moduleID, optionName, optionMulti);
					}
				});
			}
		},
		saveCurrentModuleOptions: function() {
			module.stageCurrentModuleOptions();
			commitStagedOptions();
			notifyOptionsSaved();
		},
		open: function(moduleIdOrCategory) {
			var category, moduleID;
			if (!this.RESConsoleContainer) {
				RESConsole.create();
			}

			if (modules[moduleIdOrCategory]) {
				var module = modules[moduleIdOrCategory];
				moduleID = module && module.moduleID;
				category = module && [].concat(module.category)[0];
			} else if (this.categories[moduleIdOrCategory]) {
				category = moduleIdOrCategory;
				moduleID = this.getModuleIDsByCategory(category)[0];
			}
			if (!moduleID || !moduleID.length) {
				moduleID = RESdefaultModuleID;
				category = [].concat(modules[moduleID].category)[0];
			}

			// Draw the config panel
			this.showConfigOptions(moduleID);

			this.isOpen = true;
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
			this.modalOverlay.classList.remove('fadeOut');
			this.modalOverlay.classList.add('fadeIn');

			// this.RESConsoleContainer.setAttribute('style','display: block; left: ' + leftCentered + 'px');
			// this.RESConsoleContainer.setAttribute('style','display: block; left: 1.5%;');
			this.RESConsoleContainer.classList.remove('slideOut');
			this.RESConsoleContainer.classList.add('slideIn');

			RESStorage.setItem('RESConsole.hasOpenedConsole', true);

			if (modules['settingsNavigation'] && modules['settingsNavigation'].RESSearchBox) {
				modules['settingsNavigation'].RESSearchBox.focus();
			}

			$('body').on('keyup', RESConsole.handleEscapeKey);
		},
		handleEscapeKey: function(event) {
			// don't close if the user is in a token input field (e.g. adding subreddits to a list)
			// because they probably just want to cancel the dropdown list
			if (event.which === 27 && (document.activeElement.id.indexOf('token-input') === -1)) {
				RESConsole.close();
				$('body').off('keyup', RESConsole.handleEscapeKey);
			}
		},
		close: function(resetUrl) {
			$('#moduleOptionsSave').fadeOut();
			this.isOpen = false;
			// Let's be nice to reddit and put their ad frame back now...
			var adFrame = document.getElementById('ad-frame');
			if ((typeof adFrame !== 'undefined') && (adFrame !== null)) {
				adFrame.style.display = 'block';
			}

			modules['styleTweaks'].setSRStyleToggleVisibility(true, 'RESConsole');

			// this.RESConsoleContainer.setAttribute('style','display: none;');
			this.modalOverlay.classList.remove('fadeIn');
			this.modalOverlay.classList.add('fadeOut');
			this.RESConsoleContainer.classList.remove('slideIn');
			this.RESConsoleContainer.classList.add('slideOut');
			setTimeout(function() {
				// Main reason for timeout: https://bugzilla.mozilla.org/show_bug.cgi?id=625289
				document.querySelector('body').classList.remove('res-console-open');
			}, 500);
			// just in case the user was in the middle of setting a key and decided to close the dialog, clean that up.
			if (typeof RESConsole.keyCodeModal !== 'undefined') {
				RESConsole.keyCodeModal.style.display = 'none';
				RESConsole.captureKey = false;
			}

			// Closing should reset the URL by default
			if (typeof resetUrl !== 'undefined' && !resetUrl) {
				return;
			}

			modules['settingsNavigation'].resetUrlHash();
		},
		openCategoryPanel: function(categories) {
			var items = $(module.RESConsoleContainer).find('#RESConfigPanelModulesList .RESConfigPanelCategory');

			var categories = [].concat(categories);
			var selected = items.filter(function() {
				var thisValue = $(this).data('category');

				return categories.indexOf(thisValue) !== -1;
			})
			if (selected.filter('.active').length === 0) {
				items.not(selected).removeClass('active');
				selected.addClass('active');
			}
		},
		updateAdvancedOptionsVisibility: function() {
			if (modules['settingsNavigation'].options.showAllOptions.value) {
				document.getElementById('RESConsoleContent').classList.remove('advanced-options-disabled');
			} else {
				document.getElementById('RESConsoleContent').classList.add('advanced-options-disabled');
			}
		},
		getOptionValue: function(moduleID, optionKey) {
			var optionInput = document.getElementById(optionKey);
			if (optionInput) {
				return optionInput.value;
			} else {
				console.error('Cannot get a value for ' + moduleID + '.' + optionKey +
					' because the HTML element does not exist.');
				return null;
			}
		},
		setOptionValue: function(moduleID, optionKey, value) {
			var optionInput = document.getElementById(optionKey);
			if (optionInput) {
				optionInput.value = value;
			} else {
				console.error('Cannot set a value for ' + moduleID + '.' + optionKey +
					' because the HTML element does not exist.');
			}
		},
		makeOptionTableSortable: function(tableBody, moduleID, optionKey) {
			function cleanupDrag($item) {
				$item.removeData(['oldIndex', 'dragOffset']);
				$(RESConsole.RESConfigPanelOptions).edgescroll('stop');
				$item.find('>td').removeAttr('style')
			}
			$(tableBody).sortable({
				nested: false,
				handle: '.handle',
				placeholderClass: 'RESSortPlaceholder',
				placeholder: '<tr class="RESSortPlaceholder"><td></td></tr>',
				containerSelector: 'tbody',
				itemSelector: 'tr',
				onCancel: function ($item, container, _super, event) {
					_super($item, container, _super, event);
					cleanupDrag($item);
				},
				onDrop: function($item, container, _super, event) {
					_super($item, container, _super, event);

					var oldIndex = $item.data('oldIndex');
					    newIndex = $item.index();

					var rows = modules[moduleID].options[optionKey].value;
					var row = rows.splice(oldIndex, 1)[0];
					rows.splice(newIndex, 0, row);

					cleanupDrag($item);
				},
				onDrag: function ($item, position, _super, event) {
					var dragOffset = $item.data('dragOffset');
					//Reposition the row, remembering to apply the offset
					$item.css({
						top: position.top - dragOffset.top,
						left: position.left - dragOffset.left
					});
				},
				onDragStart: function ($item, container, _super, event) {
					_super($item, container, _super, event);

					$(RESConsole.RESConfigPanelOptions).edgescroll({speed: 4});

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
	});

	var stagedOptions = {};
	function stageOption(moduleID, optionName, optionValue) {
		stageOptions[moduleID] = stagedOptions[moduleID] || {};
		stageOptions[moduleID][optionName] = {
			value: optionValue
		};
	}
	function commitStagedOptions() {
		$.each(stagedOptions, function (moduleID, module) {
			$.each(module, function(optionName, optionValue) {
				RESUtils.options.setOption(moduleID, optionName, optionValue);
			});
		});
		stagedOptions = {};
	}

	function getOptions(moduleID) {
		var stored = RESUtils.options.getOptions(moduleID);
		var staged = stagedOptions[moduleID];

		var merged = $.extend(true, {}, stored, staged);
		return merged;
	}

	function notifyOptionsSaved() {
		var statusEle = module.RESConsoleContainer.querySelector('#moduleOptionsSaveStatus');
		if (statusEle) {
			$(statusEle).text('Options have been saved...');
			statusEle.setAttribute('style', 'display: block; opacity: 1');
			setTimeout(RESUtils.fadeElementOut, 500, statusEle, 1.0);
		}
	}
});
