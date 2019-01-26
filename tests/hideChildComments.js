const parent = '#thing_t1_ddh0nwy';
const child = '#thing_t1_ddh0o17';
const subchild = '#thing_t1_ddh0o8j';
const parent2 = '#thing_t1_ddh1usm';
const child2 = '#thing_t1_ddh1uyl';
const subchild2 = '#thing_t1_ddh1v1h';
const hideAll = '.thing.link .res-toggleAllChildren';

function toggleChildren(thingSelector) {
	return `${thingSelector} > .entry .toggleChildren`;
}

module.exports = {
	'basic functionality': browser => {
		browser
			.url('https://en.reddit.com/r/RESIntegrationTests/comments/5sq835/hide_child_comments/')
			.waitForElementVisible(toggleChildren(parent))
			.assert.visible(child)
			.assert.visible(subchild)

			.click(toggleChildren(parent))
			.waitForElementNotVisible(child)
			.click(toggleChildren(parent))
			.assert.visible(child)
			.assert.visible(subchild)

			.click(toggleChildren(child))
			.waitForElementNotVisible(subchild)
			.assert.visible(child)
			.click(toggleChildren(child))
			.assert.visible(subchild)

			.end();
	},
	'works for non-english languages (korean)': browser => {
		browser
			.url('https://ko.reddit.com/r/RESIntegrationTests/comments/5sq835/hide_child_comments/')
			.waitForElementVisible(toggleChildren(parent))
			.click(toggleChildren(parent))
			.waitForElementNotVisible(child)
			.end();
	},
	'hide all': browser => {
		browser
			// when clicking "hide all"
			.url('https://en.reddit.com/r/RESIntegrationTests/comments/5sq835/hide_child_comments/')
			.waitForElementVisible(hideAll)
			.assert.visible(parent)
			.assert.visible(child)
			.assert.visible(subchild)
			.assert.visible(subchild2)
			.click(hideAll)
			.waitForElementNotVisible(subchild)
			.waitForElementNotVisible(subchild2)
			.waitForElementNotVisible(child)
			.waitForElementNotVisible(child2)
			.assert.visible(parent)
			.assert.visible(parent2)
			.click(toggleChildren(parent))
			.assert.visible(parent)
			.assert.visible(child)
			.assert.visible(subchild)
			.waitForElementNotVisible(subchild2)
			.click(toggleChildren(parent2))
			.assert.visible(subchild2)

			// with automatic hiding
			.url('https://en.reddit.com/wiki/pages/#res:settings-redirect-standalone-options-page/hideChildComments')
			.waitForElementVisible('#RESConsoleContainer')
			.click('#automaticContainer')
			.click('#moduleOptionsSave')
			.url('https://en.reddit.com/r/RESIntegrationTests/comments/5sq835/hide_child_comments/')
			.waitForElementNotVisible(subchild)
			.waitForElementNotVisible(subchild2)
			.waitForElementNotVisible(child)
			.waitForElementNotVisible(child2)
			.assert.visible(parent)
			.assert.visible(parent2)
			.click(toggleChildren(parent))
			.assert.visible(parent)
			.assert.visible(child)
			.assert.visible(subchild)
			.waitForElementNotVisible(subchild2)
			.click(toggleChildren(parent2))
			.assert.visible(subchild2)

			.end();
	},
};
