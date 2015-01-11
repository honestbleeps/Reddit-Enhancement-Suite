modules['uploader'] = {
	moduleID: 'uploader',
	moduleName: 'Submit Page Uploader',
	category: 'UI',
	options: {
		preferredHost: {
			type: 'enum',
			value: 'mediacrush', // There are no other hosts at the moment, so the default is just MediaCrush
			values: [ /* loadDynamicOptions */ ],
			description: 'Choose the website you wish to host your files on. Do you own a hosting site you want to add?\
				<a href="https://github.com/honestbleeps/Reddit-Enhancement-Suite/wiki/Adding-new-media-hosts">Read here</a> for information on how to get yours added.'
		}
	},
	description: 'Lets you upload files from the submit page.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/r\/[a-zA-Z0-9_-]+\/submit.*/i
	],
	exclude: [ ],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	loadDynamicOptions: function() {
		for (var hostKey in modules['uploader'].hosts) {
			var host = modules['uploader'].hosts[hostKey];
			modules['uploader'].options.preferredHost.values.push({
				name: host.description,
				value: hostKey
			});
		}

		RESLoadResourceAsText('modules/hosts/hosts.json', function(str) {
			var hosts = JSON.parse(str);
			modules['uploader'].options['preferredHost'].values.sort(function(host1, host2) {
				var hi1 = hosts.indexOf(host1.value);
				var hi2 = hosts.indexOf(host2.value);

				if (hi1 === hi2) {
					return 0;
				}
				if (hi1 === -1) {
					return 1;
				}
				if (hi2 === -1) {
					return -1;
				}
				if (hi1 < hi2) {
					return -1;
				}
				if (hi1 > hi2) {
					return 1;
				}
			});
		});
	},
	go: function() {
		if (!this.isEnabled() || !this.isMatchURL()) {
			return;
		}
		var host = this.hosts[this.options.preferredHost.value];

		var url = document.getElementById('url-field');
		url.style.position = 'relative';
		var blurb = document.createElement('span');
		blurb.className = 'blurb';
		blurb.innerHTML = host.blurb;
		blurb.style.color = '#444';
		blurb.style.fontSize = '8pt';
		blurb.style.position = 'absolute';
		blurb.style.bottom = '15px';
		url.appendChild(blurb);
		var input = document.createElement('input');
		input.style.display = 'none';
		input.type = 'file';
		url.appendChild(input);
		var progress = document.createElement('span');
		progress.className = 'progress';
		var pw = document.createElement('div');
		pw.className = 'progress-wrapper';
		pw.appendChild(progress);
		url.appendChild(pw);

		function handle(file) {
			if (host.maxSize !== -1) {
				if (file.size > host.maxSize) {
					blurb.innerHTML = 'This file is too large.';
					return;
				}
			}
			host.handleFile(file, url, progress);
		}
		input.addEventListener('change', function(e) {
			handle(input.files[0]);
		}, false);
		blurb.querySelector('.file-trigger').addEventListener('click', function(e) {
			e.preventDefault();
			input.click();
		}, false);
		function nop(e) { e.stopPropagation(); e.preventDefault(); }
		window.addEventListener('dragenter', nop, false);
		window.addEventListener('dragover', nop, false);
		window.addEventListener('dragleave', nop, false);
		window.addEventListener('drop', function(e) {
			nop(e);
			handle(e.dataTransfer.files[0]);
		}, false);

		host.load(url);
	},
	hosts: {}
};
