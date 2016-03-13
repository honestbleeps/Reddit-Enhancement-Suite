

#Chrome

`gulp build -b chrome` > `/dist/chrome`

**Upload at:** https://chrome.google.com/webstore/developer/dashboard

Info: https://developer.chrome.com/webstore/publish

#Firefox

`gulp build -b firefox` > `/dist/firefox`

Upload at: https://addons.mozilla.org/en-US/developers/addon/submit/1

Info: https://developer.mozilla.org/en-US/Add-ons/Distribution

#Safari
Info: https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/DistributingYourExtension/DistributingYourExtension.html

# Safari 8 - Self-distribute

`gulp build -b safari` > `/dist/RES.safariextension`

1. Safari > Develop > Show extension builder
1. Build package
1. Upload .safariextz package to redditenhancementsuite.com
1. Update the redditnehancementsuite.com update manifest.

# Safari 9+ - Gallery

Follow Safari 8 rules, then submit to gallery:
https://developer.apple.com/safari/extensions/submission/


#Opera 

https://addons.opera.com/developer/

# Opera 20+

https://addons.opera.com/developer/

`gulp build -b oblink` > `/dist/oblink`

Opera20 does have a "Pack extension" button on the extensions page, next to "Load unpacked extension"

"Navigator" is Opera's internal name for Opera20+

# Opera 12.17

https://addons.opera.com/developer/

`gulp build -b opera` > `/dist/opera`


"Opera" is Opera's internal name for Opera12
