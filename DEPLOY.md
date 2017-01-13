# All browsers

1. Run [`npm run build`](/CONTRIBUTING.md#build-commands) for the desired browser

## Chrome

https://developer.chrome.com/webstore/publish

1. Upload `chrome.zip` to https://chrome.google.com/webstore/developer/dashboard

## Firefox

https://developer.mozilla.org/en-US/Add-ons/Distribution

1. Run `npm run jpm xpi` or `npm run jpm-beta xpi` (for beta releases)
1. Upload `reddit-enhancement-suite.xpi` to https://addons.mozilla.org/en-US/developers/addon/submit/1

## Safari

https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/DistributingYourExtension/DistributingYourExtension.html

#### Safari 8 (self-distribute)

1. Safari > Develop > Show extension builder
1. Build package
1. Upload `RES.safariextz` to redditenhancementsuite.com
1. Update the redditnehancementsuite.com update manifest

#### Safari 9+ (gallery)

1. Follow Safari 8 rules
1. Upload `RES.safariextz` to https://developer.apple.com/safari/extensions/submission/

## Opera 

https://dev.opera.com/extensions/publishing-guidelines/

1. Upload `chrome.zip` to https://addons.opera.com/developer/
