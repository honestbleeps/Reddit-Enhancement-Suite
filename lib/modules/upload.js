/*
import hosts from './hosts/hosts.json';

addModule('uploader', function(module, moduleID) {
	module.moduleName = 'Submit Page Uploader';
	module.category = ['Submissions'];
	module.description = 'Lets you upload files from the submit page.';
	module.options = {
		preferredHost: {
			type: 'enum',
			value: 'DEFAULT_HOST_HERE',
			values: [], // loadDynamicOptions
			description: 'Choose the website you wish to host your files on. Do you own a hosting site you want to add?\
				<a href="https://github.com/honestbleeps/Reddit-Enhancement-Suite/wiki/Adding-new-media-hosts">Read here</a> for information on how to get yours added.'
		}
	};
	module.include = [
		'submit'
	];
	module.hosts = {};
	module.loadDynamicOptions = async function() {
		for (const hostKey in module.hosts) {
			const host = module.hosts[hostKey];
			module.options.preferredHost.values.push({
				name: host.description,
				value: hostKey
			});
		}

		module.options['preferredHost'].values.sort(function(host1, host2) {
			const hi1 = hosts.indexOf(host1.value);
			const hi2 = hosts.indexOf(host2.value);

			if (hi1 === -1) {
				return 1;
			}
			if (hi2 === -1) {
				return -1;
			}
			return hi1 - hi2;
		});
	};
	module.go = function() {
		const host = this.hosts[this.options.preferredHost.value] || Object.getOwnPropertyNames(this.hosts)[0];
		if (!host) return;

		const url = document.getElementById('url-field');
		if (!url) return;

		url.style.position = 'relative';
		const blurb = document.createElement('div');
		blurb.className = 'blurb';
		blurb.innerHTML = host.blurb;
		blurb.style.fontSize = '11px';
		blurb.style.marginTop = '-2em';
		url.appendChild(blurb);
		const input = document.createElement('input');
		input.style.display = 'none';
		input.type = 'file';
		url.appendChild(input);
		const progress = document.createElement('span');
		progress.className = 'progress';
		const pw = document.createElement('div');
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
	};
});
*/
