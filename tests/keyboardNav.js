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
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/5pxfg2/keyboard_nav/?sort=old')
			.waitForElementVisible(`${post}.${activeThing}`)
			.keys(['j'])
			.assert.cssClassNotPresent(post, activeThing, 'move down normally (post -> comments)')
			.assert.cssClassPresent(commentA, activeThing)
			.keys(['j'])
			.assert.cssClassNotPresent(commentA, activeThing, 'move down normally (comment -> comment)')
			.assert.cssClassPresent(commentAA, activeThing)
			.keys(['p'])
			.assert.cssClassNotPresent(commentAA, activeThing, 'move to parent')
			.assert.cssClassPresent(commentA, activeThing)
			.keys(['J'])
			.assert.cssClassNotPresent(commentA, activeThing, 'move to next sibling')
			.assert.cssClassPresent(commentB, activeThing)
			.keys(['k'])
			.assert.cssClassNotPresent(commentB, activeThing, 'move up normally')
			.assert.cssClassPresent(commentAB, activeThing)
			.keys(['J'])
			.assert.cssClassNotPresent(commentAB, activeThing, 'move to next sibling, no siblings left')
			.assert.cssClassPresent(commentB, activeThing)
			.keys(['j'])
			.assert.cssClassNotPresent(commentB, activeThing, 'move down normally')
			.assert.cssClassPresent(commentBA, activeThing)
			.keys(['j'])
			.assert.cssClassNotPresent(commentBA, activeThing, 'move down normally')
			.assert.cssClassPresent(commentBB, activeThing)
			.keys([browser.Keys.ALT, 'K'])
			.assert.cssClassNotPresent(commentBB, activeThing, 'move to parent\'s previous sibling')
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
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/5pxfg2/keyboard_nav/?sort=old')
			.waitForElementVisible(`${post}.${activeThing}`)
			.keys(['j', 'k'])
			.assert.cssClassPresent(post, activeThing)
			.assert.cssClassNotPresent(firstComment, activeThing)
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
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/5n61yd/go_mode/')
			.waitForElementVisible('#RESSettingsButton')
			.keys(['g', 'F'])
			.assert.urlEquals('https://www.reddit.com/r/RESIntegrationTests/')
			// go to frontpage
			.waitForElementVisible('#RESSettingsButton')
			.keys(['g', 'f'])
			.assert.urlEquals('https://www.reddit.com/')
			.end();
	},
	'blurs target': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support elementSendKeys https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

		browser
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/5pxfg2/keyboard_nav/?sort=old')
			.waitForElementVisible('#thing_t1_dcuk08v > .entry .toggleChildren')
			.click('#thing_t1_dcuk08v > .entry .toggleChildren')
			// moving down should blur "hide child comments"
			.keys(['J'])
			.keys([browser.Keys.ENTER])
			.assert.cssClassPresent('#thing_t1_dcuk0d6', 'collapsed')
			.waitForElementNotVisible('#thing_t1_dcuk08v .child .entry', 'child comment should not be revealed')
			.end();
	},
};
