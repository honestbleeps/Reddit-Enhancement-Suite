modules['showImages'].siteModules['vidly'] = {
  domains: ['vidly.io'],
  matchRE: /^https?:\/\/(?:www\.)?vidly\.io\/([\w]+)/i,
  detect: function (href, elem) {
    return href.indexOf('vidly.io') !== -1 || href.indexOf('https://vidly.io') !== -1;
  },
  handleLink: function (elem) {
    var def = $.Deferred();
    var hashRe = /^https?:\/\/(?:www\.)?vidly\.io\/([\w]+)/i;
    var groups = hashRe.exec(elem.href);
    if (groups) {
      var input = groups['input'];
      var splinput = input.split('/');
      var apiURL = 'https://vidly.io/media/' + splinput[splinput.length - 1];
      RESUtils.runtime.ajax({
        method: 'GET',
        url: apiURL,
        // aggressiveCache: true,
        onload: function (response) {
          try {
            var json = JSON.parse(response.responseText);
            if (json && json.length > 0 && json[0]['outputs']) {
              var outputs = json[0]['outputs'];
              def.resolve(elem, "https://" + outputs);
            } else {
              def.reject();
            }
          } catch (error) {
            def.reject();
          }
        },
        onerror: function (response) {
          def.reject();
        }
      });
      // def.resolve(elem, apiURL);

    } else {
      def.reject();
    }
    return def.promise();
  },
  handleInfo: function (elem, info) {
    elem.type = 'IFRAME';
    elem.setAttribute('data-embed', info);
    elem.setAttribute('data-pause', '{"method":"pause"}');
    elem.setAttribute('data-play', '{"method":"play"}');
    return $.Deferred().resolve(elem).promise();
  }
};
