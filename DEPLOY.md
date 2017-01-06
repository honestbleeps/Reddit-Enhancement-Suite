# All browsers

1. Run `npm run build` for the desired browser

## Chrome

Info: https://developer.chrome.com/webstore/publish

1. Upload `chrome.zip` to https://chrome.google.com/webstore/developer/dashboard

## Firefox

Info: https://developer.mozilla.org/en-US/Add-ons/Distribution

1. Run `npm run jpm xpi` or `npm run jpm-beta xpi` for stable/beta
1. Upload `reddit-enhancement-suite.xpi` to https://addons.mozilla.org/en-US/developers/addon/submit/1

## Safari

Info: https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/DistributingYourExtension/DistributingYourExtension.html

#### Safari 8 - Self-distribute

1. Safari > Develop > Show extension builder
1. Build package
1. Upload `.safariextz` package to redditenhancementsuite.com
1. Update the redditnehancementsuite.com update manifest.

#### Safari 9+ - Gallery

1. Follow Safari 8 rules
1. Upload `.safariextz` to https://developer.apple.com/safari/extensions/submission/

## Opera 

Info: https://dev.opera.com/extensions/publishing-guidelines/

1. Upload `chrome.zip` to https://addons.opera.com/developer/
