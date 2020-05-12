module.exports = {
	'basic navigation': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support elementSendKeys https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

		const post = '#thing_t3_5pxfg2';
		const commentA = '#thing_t1_dcuk08v';
		const commentAA = '#thing_t1_dcuk140';
		const commentAB = '#thing_t1_dcuk1bk';
		const commentB = '#thing_t1_dcuk0d6';
		const commentBA = '#thing_t1_dcuk1gl';
		const commentBB = '#thing_t1_dcuk1oc';
		const activeThing = 'RES-keyNav-activeThing';

		browser
			.url('https://en.reddit.com/r/RESIntegrationTests/comments/5pxfg2/keyboard_nav/?sort=old')
			.waitForElementVisible(`${post}.${activeThing}`)
			.keys(['j'])
			.assert.not.cssClassPresent(post, activeThing, 'move down normally (post -> comments)')
			.assert.cssClassPresent(commentA, activeThing)
			.keys(['j'])
			.assert.not.cssClassPresent(commentA, activeThing, 'move down normally (comment -> comment)')
			.assert.cssClassPresent(commentAA, activeThing)
			.keys(['p'])
			.assert.not.cssClassPresent(commentAA, activeThing, 'move to parent')
			.assert.cssClassPresent(commentA, activeThing)
			.keys(['J'])
			.assert.not.cssClassPresent(commentA, activeThing, 'move to next sibling')
			.assert.cssClassPresent(commentB, activeThing)
			.keys(['k'])
			.assert.not.cssClassPresent(commentB, activeThing, 'move up normally')
			.assert.cssClassPresent(commentAB, activeThing)
			.keys(['J'])
			.assert.not.cssClassPresent(commentAB, activeThing, 'move to next sibling, no siblings left')
			.assert.cssClassPresent(commentB, activeThing)
			.keys(['j'])
			.assert.not.cssClassPresent(commentB, activeThing, 'move down normally')
			.assert.cssClassPresent(commentBA, activeThing)
			.keys(['j'])
			.assert.not.cssClassPresent(commentBA, activeThing, 'move down normally')
			.assert.cssClassPresent(commentBB, activeThing)
			.keys([browser.Keys.ALT, 'K'])
			.assert.not.cssClassPresent(commentBB, activeThing, 'move to parent\'s previous sibling')
			.assert.cssClassPresent(commentA, activeThing)
			.end();
	},
	'rapid subsequent keypresses': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support elementSendKeys https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

		const post = '#thing_t3_5pxfg2';
		const firstComment = '#thing_t1_dcuk08v';
		const activeThing = 'RES-keyNav-activeThing';

		browser
			.url('https://en.reddit.com/r/RESIntegrationTests/comments/5pxfg2/keyboard_nav/?sort=old')
			.waitForElementVisible(`${post}.${activeThing}`)
			.keys(['j', 'k'])
			.assert.cssClassPresent(post, activeThing)
			.assert.not.cssClassPresent(firstComment, activeThing)
			.end();
	},
	'go mode': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support elementSendKeys https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

		browser
			// go to subreddit frontpage
			.url('https://en.reddit.com/r/RESIntegrationTests/comments/5n61yd/go_mode/')
			.waitForElementVisible('#RESSettingsButton')
			.keys(['g', 'F'])
			.assert.urlContains('https://en.reddit.com/r/RESIntegrationTests/')
			// go to frontpage
			.waitForElementVisible('#RESSettingsButton')
			.keys(['g', 'f'])
			.assert.urlContains('https://en.reddit.com/')
			.end();
	},
	'blurs target': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support elementSendKeys https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

		browser
			.url('https://en.reddit.com/r/RESIntegrationTests/comments/5pxfg2/keyboard_nav/?sort=old')
			.waitForElementVisible('#thing_t1_dcuk08v > .entry .toggleChildren')
			.click('#thing_t1_dcuk08v > .entry .toggleChildren')
			// moving down should blur "hide child comments"
			.keys(['J'])
			.keys([browser.Keys.ENTER])
			.assert.cssClassPresent('#thing_t1_dcuk0d6', 'collapsed')
			.waitForElementNotVisible('#thing_t1_dcuk08v .child .entry', 'child comment should not be revealed')
			.end();
	},
	'key help': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support elementSendKeys https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

		browser
			.url('https://en.reddit.com/r/RESIntegrationTests/comments/5pxfg2/keyboard_nav/')
			.waitForElementVisible('#RESSettingsButton')
			.keys(['?'])
			.assert.visible('#keyHelp')
			.assert.containsText('#keyHelp', 'shift-/')
			.assert.containsText('#keyHelp', 'Show help for keyboard shortcuts.')
			.end();
	},
	'link number annotations': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support elementSendKeys https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

		browser
			.url('https://en.reddit.com/r/RESIntegrationTests/comments/633x7q/link_number_annotations/')
			.waitForElementVisible('.thing.link')
			.click('.thing.link .md strong')
			.assert.visible('.thing.link .keyNavAnnotation')
			.assert.attributeEquals('.thing.link .keyNavAnnotation', 'data-text', '[1]')
			.assert.not.elementPresent('.thing.comment .keyNavAnnotation')
			.click('.thing.comment .md strong')
			.assert.visible('.thing.comment .keyNavAnnotation')
			.assert.attributeEquals('.thing.comment .keyNavAnnotation', 'data-text', '[1]')
			.assert.not.elementPresent('.thing.link .keyNavAnnotation')
			.keys(['1'])
			// switch to newly opened background tab
			.windowHandles(result => {
				browser.switchWindow(result.value[1]);
			})
			.assert.urlContains('https://www.reddit.com/r/RESIntegrationTests')
			.end();
	},
};
