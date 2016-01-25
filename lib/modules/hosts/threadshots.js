addLibrary('mediaHosts', 'threadshots', {
	domains: [ 'threadshots.com' ],
	name: 'ThreadShots.com',
    logo: '//threadshots.com/static/img/favicon.ico',

	detect: function(href, elem) {
		return href.indexOf('threadshots.com/') !== -1;
	},

	handleLink: function(elem) {
		var def = $.Deferred();

        //this is a direct image link, no need to fetch the page
        if(elem.href.indexOf('static/ts/') > -1) {
            def.resolve(elem, elem.href);
        }
        //this is a link to a threadshot page and we should fetch the image
        else if(elem.href.indexOf('/ts/') > -1) {
            RESEnvironment.ajax({
                method: 'GET',
                url: elem.href,
                onload: function(response) {
                    //parse the image url
                    var regex = /<img[^>]*?["']user-img["'][^>]*?src=["']([^"']*)["'][^>]/g;
                    var href = null;
                    var matched_parts = [];
                    //use the last instance so that user generated titles can't trick this
                    while( (matched_parts = regex.exec(response.responseText)) !== null ) {
                        href = matched_parts[1];
                    }
                    if(href === null) {
                        def.reject();
                    }
                    else {
                        def.resolve(elem, href);
                    }
                },
                onerror: function(response) {
                    def.reject();
                }
            });
        }
        else {
            def.reject();
        }

		return def.promise();
	},

	handleInfo: function(elem, href) {
        elem.type = 'IMAGE';
        elem.src = href;

		return $.Deferred().resolve(elem).promise();
	}
});
