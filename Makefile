TESTS = $(shell find test -type f -name "*.js")
TESTTIMEOUT = 5000
REPORTER = spec
PROJECT_DIR = $(shell pwd)

test:
	@npm install
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter $(REPORTER) --timeout $(TESTTIMEOUT) $(TESTS)

lib-cov:
	@rm -rf ./$@
	@jscoverage --encoding=utf-8 ./lib ./$@

test-cov: lib-cov
	@MONGOSKIN_COV=1 $(MAKE) test REPORTER=progress
	@MONGOSKIN_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html
	@$(MAKE) test REPORTER=markdown > test_results.md

.PHONY: test test-cov lib-cov
