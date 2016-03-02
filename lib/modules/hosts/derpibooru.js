addLibrary('mediaHosts', 'derpibooru', {
	name: 'Derpibooru',
	domains: [
		'derpiboo.ru',
		'derpibooru.org',
		'trixiebooru.org',
	],
	pathMatcher: /^\/(?:images\/)?(\d+)$/i,

	detect(_href, elem) {
		const mod = modules['showImages'].siteModules['derpibooru'];

		return mod.pathMatcher.test(elem.pathname);
	},

	fetchJSON(url) {
		const def = $.Deferred();

		RESEnvironment.ajax({
			method: 'GET',
			url: url,
			onload(response) {
				let json;
				try {
					json = JSON.parse(response.responseText);
				} catch (error) {
					def.reject();
				}
				def.resolve(json);
			},
			onerror(response) {
				def.reject();
			}
		});

		return def.promise();
	},

	// Fetches image information from the Derpibooru API for the specified ID
	// numbers without trying to follow redirects in the case of duplicate images.
	fetchMultipleImageDataIgnoringDups(imageIDs) {
		const mod = modules['showImages'].siteModules['derpibooru'];
		const def = $.Deferred();

		const apiURL = 'https://' + mod.domains[0] + '/api/v2/images/show.json?id_numbers=' + encodeURIComponent(imageIDs.join(','));

		mod.fetchJSON(apiURL).then((json) => {
			if (Array.isArray(json.images)) {
				def.resolve(json.images);
			} else {
				def.reject();
			}
		}, () => {
			def.reject();
		});

		return def.promise();
	},

	maxDuplicateDepth: 1,

	// Takes an array of image requests with imageID, deferred, and duplicateDepth
	// properties. Requests data about the images, and follows redirects to
	// duplicates up to a depth of `maxDuplicateDepth`. (These requests may be
	// batched using `batchFetchImageData`.) Resolves the deferreds with the
	// appropriate image data as results become available. Returns a deferred that
	// resolves or rejects based on the agregate state of all other deferreds
	// passed to this function. (Resolves once all are resolved, or rejects if any
	// are rejected.)
	fetchMultipleImageData(imageRequests) {
		const mod = modules['showImages'].siteModules['derpibooru'];

		const requestsByImageID = imageRequests.reduce((obj, request) => {
			obj[request.imageID] = request;
			return obj;
		}, {});
		const imageIDs = Object.keys(requestsByImageID);

		mod.fetchMultipleImageDataIgnoringDups(imageIDs).then((results) => {
			const resultsByImageID = results.reduce((obj, result) => {
				obj[result.id_number] = result;
				return obj;
			}, {});
			imageIDs.forEach((imageID) => {
				const request = requestsByImageID[imageID];
				const result = resultsByImageID[imageID];

				if (result === undefined) {
					// API doesn't return a result for this image for some unknown reason
					// Example: https://derpiboo.ru/api/v2/images/show.json?id_numbers=17
					request.deferred.reject();
				} else if (result.duplicate_of) {
					// Duplicate image.
					// Example: https://derpiboo.ru/api/v2/images/show.json?id_numbers=975313
					if (request.duplicateDepth < mod.maxDuplicateDepth) {
						mod.batchFetchImageData(result.duplicate_of, {
							duplicateDepth: request.duplicateDepth+1,
						}).then(
							(resolvedValue) => request.deferred.resolve(resolvedValue),
							(err) => request.deferred.reject(err),
						);
					} else {
						request.deferred.reject();
					}
				} else if (result.image) {
					// Normal image.
					// Example: https://derpiboo.ru/api/v2/images/show.json?id_numbers=0
					request.deferred.resolve(result);
				} else {
					// Deleted image, or some other error.
					// Example: https://derpiboo.ru/api/v2/images/show.json?id_numbers=898402
					request.deferred.reject();
				}
			});
		}, () => {
			imageRequests.forEach((req) => req.deferred.reject());
		});

		return $.when(imageRequests.map((req) => req.deferred));
	},

	deferredImageRequests: [],
	batchDebounceTime: 250,
	batchMaxSize: 50,

	doFetchBatch() {
		const mod = modules['showImages'].siteModules['derpibooru'];

		mod.fetchMultipleImageData(mod.deferredImageRequests);
		mod.deferredImageRequests = [];
	},

	// Accumulate image requests until `batchMaxSize` requests are accumulated or
	// `batchDebounceTime` passes with no additional batched requests made. Then,
	// call `doFetchBatch` to fetch data for all accumulated image requests in a
	// single API call. Returns a promise which resolves with the data for this
	// individual image ID.
	batchFetchImageData(imageID, {duplicateDepth=0}={}) {
		const mod = modules['showImages'].siteModules['derpibooru'];
		const def = $.Deferred();

		mod.deferredImageRequests.push({deferred: def, imageID, duplicateDepth});

		const debounceName = 'showImages.derpibooru.doFetchBatch';
		if (mod.deferredImageRequests.length == mod.batchMaxSize) {
			RESUtils.debounce(debounceName); // Clear debounce
			mod.doFetchBatch();
		} else {
			RESUtils.debounce(debounceName, mod.batchDebounceTime, mod.doFetchBatch);
		}

		return def.promise();
	},

	handleLink(elem) {
		const mod = modules['showImages'].siteModules['derpibooru'];
		const def = $.Deferred();

		const imageID = mod.pathMatcher.exec(elem.pathname)[1];

		mod.batchFetchImageData(imageID).then((json) => {
			def.resolve(elem, json);
		}, () => {
			def.reject();
		});

		return def.promise();
	},

	handleInfo(elem, info) {
		elem.type = 'IMAGE';
		elem.src = info.image;
		if (info.description) elem.caption = info.description;

		return $.Deferred().resolve(elem).promise();
	}
});
