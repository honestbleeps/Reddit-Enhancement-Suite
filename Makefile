PREFIX = .
SRC_DIR = ${PREFIX}/lib
BUILD_DIR = ${PREFIX}/build
INTER_DIR = ${PREFIX}/build/output

# Browser dirs
CHROME_DIR = ${PREFIX}/Chrome
OPERA_DIR = ${PREFIX}/Opera/includes
SAFARI_DIR = ${PREFIX}/RES.safariextension
FIREFOX_DIR = ${PREFIX}/XPI/data
BROWSER_DIRS = ${CHROME_DIR} \
	${OPERA_DIR} \
	${SAFARI_DIR} \
	${FIREFOX_DIR}

# Locate node.js
JS_ENGINE ?= "`which node nodejs 2>/dev/null`"

# Input files to be merged together. List in ordered required
MODULES = ${SRC_DIR}/reddit_enhancement_suite.user.js

# Output
JQUERY_SHORT = jquery-1.6.4.min.js
JQUERY = ${SRC_DIR}/${JQUERY_SHORT}
RES_SHORT = reddit_enhancement_suite.user.js
RES = ${INTER_DIR}/${RES_SHORT}

# Pre-processing
VERSION = $(shell cat version.txt)
DATE = $(shell git log -1 --pretty=format:%ad)
PREPROCESS = "sed 's/@@DATE@@/'\"${DATE}\"'/' | \
	sed 's/@@VERSION@@/'\"${VERSION}\"'/' | \
	sed 's/@@JQUERY_FILE@@/'\"${JQUERY_SHORT}\"'/' | \
	sed 's/@@RES_FILE@@/'\"${RES_SHORT}\"'/'"

###########################################################

# Targets
all: res browsers hint

rebuild: clean all

${INTER_DIR}:
	@@mkdir -p ${INTER_DIR}

res: ${RES}

${RES}: | ${INTER_DIR}
	@@echo "Building..."
	@@cat ${MODULES} | eval ${PREPROCESS} > ${RES};

chrome: res
	@@cat ${CHROME_DIR}/manifest.json.in | eval ${PREPROCESS} > ${CHROME_DIR}/manifest.json
	@@cp ${JQUERY} ${CHROME_DIR}
	@@cp ${RES} ${CHROME_DIR}

opera: res
	@@mkdir -p ${OPERA_DIR}
	@@cat ${OPERA_DIR}/../config.xml.in | eval ${PREPROCESS} > ${OPERA_DIR}/../config.xml
	@@cp ${RES} ${OPERA_DIR}

safari: res
	@@cat ${SAFARI_DIR}/Info.plist.in | eval ${PREPROCESS} > ${SAFARI_DIR}/Info.plist
	@@cp ${JQUERY} ${SAFARI_DIR}
	@@cp ${RES} ${SAFARI_DIR}

firefox: res
	@@mkdir -p ${FIREFOX_DIR}
	@@cat ${FIREFOX_DIR}/../package.json.in | eval ${PREPROCESS} > ${FIREFOX_DIR}/../package.json
	@@cp ${JQUERY} ${FIREFOX_DIR}
	@@cp ${RES} ${FIREFOX_DIR}

browsers: res chrome opera safari firefox

hint: res
	@@if test ! -z ${JS_ENGINE}; then \
		echo "Testing against JSHint..."; \
		${JS_ENGINE} ${BUILD_DIR}/jshint-check.js ${RES}; \
	else \
		echo "You must have NodeJS installed in order to test against JSHint."; \
	fi

###########################################################

clean-chrome:
	@@rm -f ${CHROME_DIR}/manifest.json
	@@rm -f ${CHROME_DIR}/${JQUERY_SHORT}
	@@rm -f ${CHROME_DIR}/${RES_SHORT}

clean-opera:
	@@rm -f ${OPERA_DIR}/../config.xml
	@@rm -f ${OPERA_DIR}/${RES_SHORT}

clean-safari:
	@@rm -f ${SAFARI_DIR}/Info.plist
	@@rm -f ${SAFARI_DIR}/${JQUERY_SHORT}
	@@rm -f ${SAFARI_DIR}/${RES_SHORT}

clean-firefox:
	@@rm -f ${FIREFOX_DIR}/../package.json
	@@rm -f ${FIREFOX_DIR}/${JQUERY_SHORT}
	@@rm -f ${FIREFOX_DIR}/${RES_SHORT}

clean-browsers: clean-chrome clean-opera clean-safari clean-firefox

clean: clean-browsers
	@@rm -rf ${INTER_DIR}
	@@echo "Cleaned"

###########################################################

.PHONY: all rebuild res hint clean chrome opera safari firefox browsers clean-chrome clean-opera clean-safari clean-firefox clean-browsers