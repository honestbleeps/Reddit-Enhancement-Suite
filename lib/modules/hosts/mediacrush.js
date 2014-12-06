modules['uploader'].hosts['mediacrush'] = {
	name: 'MediaCrush',
	description: '<img width="16" height="16" src="' + MediaCrush.logo + '" style="position: relative; top: 3px" /> \
						<a href="https://mediacru.sh/about" target="_blank">MediaCrush</a>',
	blurb: 'Drag and drop or <a href="#" class="file-trigger">click to upload</a> images, audio, or video.',
	maxSize: 100000000 /* MediaCrush advertises 50 MB but we're actually quite lenient */,
	load: function(ui) {
	},
	handleFile: function(file, ui, progressBar) {
		var blurb = ui.querySelector('.blurb');
		blurb.innerHTML = 'Uploading...';
		var url = document.getElementById('url');

		function done(blob) {
			if (blob.status === "error" || blob.status === "internal_error") {
				progressBar.classList.add('progress-red');
				blurb.innerHTML = 'There was a problem with this file.';
			} else if (blob.status === "unrecognised") {
				progressBar.classList.add('progress-red');
				blurb.innerHTML = 'This file format was not recognized.';
			} else if (blob.status === "timeout") {
				progressBar.classList.add('progress-red');
				blurb.innerHTML = 'This file took too long to process.';
			} else {
				progressBar.style.width = '0%';
				progressBar.className = 'progress';
				url.value = blob.url;
				blurb.innerHTML = 'Done!';
			}
		}

		MediaCrush.upload(file, function(blob) {
			if (blob.status === "done" || blob.status === "ready") {
				done(blob);
			} else {
				blurb.innerHTML = 'Processing, please wait...';
				progressBar.style.width = '100%';
				progressBar.classList.add('progress-green');
				blob.wait(function(blob) {
					done(blob);
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
