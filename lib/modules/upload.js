/*
addModule('uploader', {
	moduleID: 'uploader',
	moduleName: 'Submit Page Uploader',
	category: ['Submissions'],
	options: {
		preferredHost: {
			type: 'enum',
			value: 'DEFAULT_HOST_HERE',
			values: [], // loadDynamicOptions
			description: 'Choose the website you wish to host your files on. Do you own a hosting site you want to add?\
				<a href="https://github.com/honestbleeps/Reddit-Enhancement-Suite/wiki/Adding-new-media-hosts">Read here</a> for information on how to get yours added.'
		}
	},
	description: 'Lets you upload files from the submit page.',
	isEnabled: function() {
		return RESUtils.options.getModulePrefs(this.moduleID);
	},
	include: [
		'submit'
	],
	exclude: [ ],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	loadLibraries: function() {
		var module = this;
		return RESUtils.init.await.library('mediaHostUploaders').then(function(hosts) {
			module.hosts = hosts;
		});
	},
	loadDynamicOptions: function() {
		for (var hostKey in modules['uploader'].hosts) {
			var host = modules['uploader'].hosts[hostKey];
			modules['uploader'].options.preferredHost.values.push({
				name: host.description,
				value: hostKey
			});
		}

		RESEnvironment.loadResourceAsText('modules/hosts/hosts.json', function(str) {
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
		var host = this.hosts[this.options.preferredHost.value] || Object.getOwnPropertyNames(this.hosts)[0];
		if (!host) return;

		var url = document.getElementById('url-field');
		if (!url) return;

		url.style.position = 'relative';
		var blurb = document.createElement('div');
		blurb.className = 'blurb';
		blurb.innerHTML = host.blurb;
		blurb.style.fontSize = '11px';
		blurb.style.marginTop = '-2em';
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
});
*/
