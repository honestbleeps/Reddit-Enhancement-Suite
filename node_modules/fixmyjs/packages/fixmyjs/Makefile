test:
	@vows tests/index.js --spec

coverage: clean cover

cover:
	@jscoverage . /tmp/jscoverage --exclude=node_modules --exclude=packages --exclude=tests && \
	mv /tmp/jscoverage . && \
	vows tests/index.js --cover-html && \
	google-chrome coverage.html

clean:
	@rm -rf jscoverage && rm -f coverage.html
