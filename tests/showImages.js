module.exports = {
	'image expando': browser => {
		let oldWindowHandles;

		browser
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/60edn3/image_expando/')
			.waitForElementVisible('.expando-button')
			.assert.cssClassPresent('.expando-button', 'image')
			.assert.cssClassPresent('.expando-button', 'collapsedExpando')
			.assert.attributeEquals('.expando-button', 'data-host', 'default')

			.click('.expando-button')
			.waitForElementVisible('.res-expando-box')
			.assert.cssClassPresent('.res-expando-box', 'res-media-host-default')
			.assert.attributeEquals('.res-expando-box img', 'src', 'http://fc04.deviantart.net/fs51/i/2009/278/e/6/THEN_by_SamSaxton.jpg')
			.assert.attributeEquals('.res-expando-box a', 'href', 'http://fc04.deviantart.net/fs51/i/2009/278/e/6/THEN_by_SamSaxton.jpg')

			.pause(1000)
			.window_handles(result => {
				// store old window handles, to keep track of, e.g. beta release notes
				oldWindowHandles = result.value;
			})
			.click('.res-expando-box img')
			// old tab didn't navigate
			.assert.urlEquals('https://www.reddit.com/r/RESIntegrationTests/comments/60edn3/image_expando/')
			// image opened in new tab, focused
			.window_handles(result => {
				browser.switchWindow(result.value.filter(win => !oldWindowHandles.includes(win))[0]);
			})
			// deviantart may redirect to a different CDN server
			.assert.urlContains('/i/2009/278/e/6/then_by_samsaxton.jpg')

			.end();
	},
	'video expando': browser => {
		browser
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/60ef59/video_expando/')
			.waitForElementVisible('.expando-button')
			.assert.cssClassPresent('.expando-button', 'video')
			.assert.cssClassNotPresent('.expando-button', 'video-muted')
			.assert.cssClassPresent('.expando-button', 'collapsedExpando')
			.assert.attributeEquals('.expando-button', 'data-host', 'defaultVideo')
			.click('.expando-button')
			.waitForElementVisible('.res-expando-box')
			.assert.cssClassPresent('.res-expando-box', 'res-media-host-defaultVideo')
			.assert.attributeEquals('.res-expando-box video > source', 'src', 'http://mediadownloads.mlb.com/mlbam/mp4/2016/04/13/586892283/1460516257186/asset_1800K.mp4')
			.end();
	},
	'audio expando': browser => {
		browser
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/60efz8/audio_expando/')
			.waitForElementVisible('.expando-button')
			.assert.cssClassPresent('.expando-button', 'video')
			.assert.cssClassPresent('.expando-button', 'collapsedExpando')
			.assert.attributeEquals('.expando-button', 'data-host', 'defaultAudio')
			.click('.expando-button')
			.waitForElementVisible('.res-expando-box')
			.assert.cssClassPresent('.res-expando-box', 'res-media-host-defaultAudio')
			.assert.attributeEquals('.res-expando-box audio > source', 'src', 'https://wiki.teamfortress.com/w/images/8/85/Scout_stunballhit11.wav?t=20100625234511')
			.end();
	},
	'iframe expando': browser => {
		browser
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/60egvo/iframe_expando/')
			.waitForElementVisible('.expando-button')
			.assert.cssClassPresent('.expando-button', 'video')
			.assert.cssClassPresent('.expando-button', 'collapsedExpando')
			.assert.attributeEquals('.expando-button', 'data-host', 'youtube')
			.click('.expando-button')
			.waitForElementVisible('.res-expando-box')
			.assert.cssClassPresent('.res-expando-box', 'res-media-host-youtube')
			.assert.attributeContains('.res-expando-box iframe', 'src', 'https://www.youtube.com/embed/iwGFalTRHDA')
			.assert.visible('.res-iframe-expando-drag-handle', 'resize handle visible')
			.end();
	},
	'generic expando': browser => {
		browser
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/60eh9o/generic_expando/')
			.waitForElementVisible('.expando-button')
			.assert.cssClassPresent('.expando-button', 'selftext')
			.assert.cssClassPresent('.expando-button', 'collapsedExpando')
			.assert.attributeEquals('.expando-button', 'data-host', 'miiverse')
			.click('.expando-button')
			.waitForElementVisible('.res-expando-box')
			.assert.cssClassPresent('.res-expando-box', 'res-media-host-miiverse')
			.end();
	},
	'gallery expando': browser => {
		browser
			.url('https://en.reddit.com/r/RESIntegrationTests/comments/60ehhc/gallery_expando/')
			.waitForElementVisible('.expando-button')
			.assert.cssClassPresent('.expando-button', 'image')
			.assert.cssClassPresent('.expando-button', 'gallery')
			.assert.cssClassPresent('.expando-button', 'collapsedExpando')
			.assert.attributeEquals('.expando-button', 'data-host', 'imgur')
			.assert.attributeEquals('.expando-button', 'title', '2 items in gallery')
			.click('.expando-button')
			.waitForElementVisible('.res-expando-box')
			.assert.cssClassPresent('.res-expando-box', 'res-media-host-imgur')
			.assert.containsText('.res-expando-box', '1 of 2')
			.assert.attributeEquals('.res-expando-box .res-gallery-pieces > div:not([hidden]) img', 'src', 'https://i.imgur.com/rXZWEIB.jpg')
			.assert.attributeEquals('.res-expando-box .res-gallery-pieces > div:not([hidden]) a', 'href', 'https://imgur.com/rXZWEIB,eutVEAv#rXZWEIB')
			.click('.res-expando-box .res-gallery-next')
			.assert.containsText('.res-expando-box', '2 of 2')
			.assert.attributeEquals('.res-expando-box .res-gallery-pieces > div:not([hidden]) img', 'src', 'https://i.imgur.com/eutVEAv.jpg')
			.assert.attributeEquals('.res-expando-box .res-gallery-pieces > div:not([hidden]) a', 'href', 'https://imgur.com/rXZWEIB,eutVEAv#eutVEAv')
			.end();
	},
	'crosspost expando': browser => {
		browser
			.url('https://en.reddit.com/by_id/t3_7fsw5w/')
			.waitForElementVisible('.expando-button')
			.click('.expando-button')
			.waitForElementVisible('.res-expando-box')
			.assert.cssClassPresent('.crosspost-preview', 'res-crosspost-preview')
			.assert.containsText('.crosspost-preview .title', 'Original post with expandoable image for crossposting')
			.assert.attributeContains('.crosspost-preview a.author', 'href', '/user/andytuba/')
			.assert.attributeContains('.crosspost-preview a.subreddit', 'href', '/r/RESIntegrationTests/')
			.end();
	},
	'show images button': browser => {
		browser
			.url('https://en.reddit.com/by_id/t3_6346fk,t3_6346h7')
			.refresh() // get rid of update notification
			.waitForElementVisible('.res-show-images')
			.assert.containsText('.res-show-images', 'show images')
			.assert.attributeContains('.res-show-images a', 'aftercontent', '(2)')
			.assert.cssClassNotPresent('.res-show-images', 'selected')
			.click('.res-show-images')
			.assert.cssClassPresent('.res-show-images', 'selected')
			.waitForElementVisible('#thing_t3_6346fk .res-expando-box img')
			.waitForElementVisible('#thing_t3_6346h7 .res-expando-box img')
			.click('.res-show-images')
			.assert.cssClassNotPresent('.res-show-images', 'selected')
			.waitForElementNotVisible('#thing_t3_6346fk .res-expando-box img')
			.waitForElementNotVisible('#thing_t3_6346h7 .res-expando-box img')
			.end();
	},
};
