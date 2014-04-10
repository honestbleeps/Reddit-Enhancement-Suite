var fs = require('fs'),
	webdriver = require('selenium-webdriver'),
    SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;

var By = webdriver.By;

exports.getServer = function() {
	var seleniumJarDir = __dirname + '/../../node_modules/selenium-server/lib/runner/';
	var seleniumJarFileName = fs
		.readdirSync(seleniumJarDir)
		.filter(function(fn) { return fn.match(/\.jar$/); })
		[0];
	var seleniumJarPath = seleniumJarDir + seleniumJarFileName;
	var server = new SeleniumServer(seleniumJarPath, { port: 0 });
	server.start();
	return server;
};

exports.testDriver = function(test, driver) {
	test.expect(2);

	// Helper function

	function waitFor(locator) {
		driver.wait(function() {
			return driver.isElementPresent(locator);
		}, 10000);
		driver.sleep(500);
		return driver.findElement(locator);
	}

	driver.get('http://www.reddit.com/r/restests');

	// Wait for page to load

	driver.wait(function() {
		return driver.getTitle().then(function(title) {
			return title === 'Test cases for Reddit Enhancement Suite';
		});
	}, 5000);

	// Wait for RES to load

	waitFor(By.id('RESSettingsButton'));

	// Test text expandos

	waitFor(By.css('.expando-button.selftext')).click();

	waitFor(By.css('.usertext-body')).getText().then(function(s) {
		test.equal(s, 'This is the text contents');
	});

	// Test YouTube expandos

	waitFor(By.css('.expando-button.video')).click();

	waitFor(By.css('iframe.media-embed'));

	// Test Imgur expandos

	waitFor(By.css('.expando-button.image')).click();

	waitFor(By.css('img.RESImage.loaded'));

	// All done, execute queued tasks and exit

	driver.quit().then(function() {
		test.ok(true);
		test.done();
	});
};
