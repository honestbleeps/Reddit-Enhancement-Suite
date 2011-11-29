FILES=src/preModules.js src/modules/* src/postModules.js

all:
	@echo "Try compile, hint, jshint, uglify, fixmyjs, or autofix."

compile:
	[ -d lib ] || mkdir lib
	cat ${FILES} > lib/reddit_enhancement_suite.user.js

hint: jshint

jshint:
	node_modules/jshint/bin/hint ${FILES} --config jshint.lax

uglify:
	node_modules/uglify-js/bin/uglifyjs --output lib/reddit_enhancement_suite.min.user.js --verbose --unsafe --reserved-names "$$" lib/reddit_enhancement_suite.user.js

fixmyjs: autofix

autofix:
	node_modules/fixmyjs/bin/fixmyjs ${FILES}

clean:
	rm -rf lib
.PHONY : compile minify hint jshint uglify fixmyjs autofix clean
