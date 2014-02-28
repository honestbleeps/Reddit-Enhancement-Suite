modules['uploadOnSubmit'] = {
	moduleID: 'uploadOnSubmit',
	moduleName: 'Upload on Submit',
	category: 'Users',
	disabledByDefault: true,
	description: 'Upload images, audio, and video by dragging and dropping onto the page when submitting new links.',
	options: {},
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/r\/[a-zA-Z0-9_-]+\/submit.*/i
	],
	exclude: [],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
	},
	go: function() {
		if (!this.isEnabled() || !this.isMatchURL()) {
			return;
		}
		var self = this;
		document.body.classList.add('upload-on-submit');
		var urlField = $('#url-field');
		RESTemplates.load('media-host-selection', function(template) {
			var ui = template.html();
			ui.insertAfter(urlField.parent());
		});

		var callToAction = $('<span class="upload">Drag and drop or <a href="#">click to upload</a> images, audio, or video up to 50 MB</span><span class="status"></span>' + 
				'<input class="hidden" type="file" multiple />' +
				'<div class="progress-wrapper"><span class="progress"></span></div>');
		callToAction.insertAfter(urlField.children('.title'));
		input = urlField.children('input[type="file"]').get()[0];
		callToAction.children('a').click(function(e) {
			e.preventDefault();
			input.click();
		});
		input.addEventListener('change', function(e) {
			self.handleFiles.apply(self, [ input.files ]);
		}, false);
		window.addEventListener('dragenter', this.dragNop, false);
		window.addEventListener('dragleave', this.dragNop, false);
		window.addEventListener('dragover', this.dragNop, false);
		window.addEventListener('drop', this.handleDragDrop, false);
	},
	dragNop: function(e) {
		e.stopPropagation();
		e.preventDefault();
	},
	handleDragDrop: function(e) {
		var self = modules['uploadOnSubmit'];
		self.dragNop(e);
		var files = e.dataTransfer.files;
		if (files.length > 0) {
			self.handleFiles.apply(self, [ files ]);
		}
	},
	handleFiles: function(files) {
		// TODO: Multiple files
		var self = this;
		var file = files[0];
		var progressBar = $('#url-field .progress').get()[0];
		var link = $('#url').get()[0];
		var text = $('#url-field .upload').get()[0];
		var status = $('#url-field .status').get()[0];
		MediaCrush.upload(file, function(result) {
			if (result.status == 'done') {
				link.value = 'https://mediacru.sh/' + result.hash;
				progressBar.classList.add('hidden');
				text.classList.add('hidden');
				status.textContent = 'Done!';
			} else {
				progressBar.classList.add('progress-green');
				text.classList.add('hidden');
				status.textContent = 'Processing... (this may take a while)';
				result.wait(function(result) {
					progressBar.classList.add('hidden');
					status.textContent = 'Done!';
					link.value = 'https://mediacru.sh/' + result.hash;
				});
			}
		}, function(e) {
			if (e.lengthComputable) {
				var progress = e.loaded / e.total;
				progressBar.style.width = (progress * 100) + '%';
			}
		});
	}
};
