/* global exports, require, __dirname */
var fs = require('fs'),
	path = require('path'),
	wrench = require('wrench'),
	webdriver = require('selenium-webdriver'),
	common = require('./common');

var profilePath      = __dirname + '/opera-profile';
var patchProfilePath = __dirname + '/opera-profile-patch';
var cleanProfilePath = __dirname + '/opera-profile-clean';

function getDriver() {
	var capabilities = webdriver.Capabilities.opera();
	capabilities.set('opera.profile', profilePath);
	return new webdriver.Builder()
		.usingServer(common.getServer().address())
		.withCapabilities(capabilities)
		.build();
}

function prepareProfile(callback) {
	if (!fs.existsSync(cleanProfilePath)) {
		if (fs.existsSync(profilePath)) {
			wrench.rmdirSyncRecursive(profilePath);
		}
		// Start Opera for the first time, to create a profile.
		var driver = getDriver();
		driver.quit().then(function() {
			// Patch the created profile to add RES.
			var resPath = path.normalize(__dirname + '/../../Opera');
			function patchDir(source, target) {
				if (!fs.existsSync(target))
					fs.mkdirSync(target);
				fs.readdirSync(source).forEach(function(de) {
					var subSource = source + '/' + de;
					var subTarget = target + '/' + de;
					if (fs.statSync(subSource).isDirectory()) {
						patchDir(subSource, subTarget);
					} else {
						var data = fs.readFileSync(subSource, {encoding:'utf8'});
						data = data.replace('RESPATH', resPath);
						fs.writeFileSync(subTarget, data);
					}
				});
			}
			patchDir(patchProfilePath, profilePath);

			// Start Opera for the second time, to allow RES to initialize.
			var driver = getDriver();
			driver.get('http://www.reddit.com/r/restests');
			driver.sleep(5000);
			driver.quit().then(function() {
				fs.renameSync(profilePath, cleanProfilePath);
				prepareProfile(callback);
			});

		});
	} else {
		wrench.copyDirSyncRecursive(cleanProfilePath, profilePath, {
			forceDelete: true
		});
		callback();
	}
}

exports.testOpera = function(test) {
	prepareProfile(function() {
		common.testDriver(test, getDriver());
	});
};
