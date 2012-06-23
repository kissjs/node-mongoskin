TESTS = $(shell find test -type f -name "*.js")
TESTTIMEOUT = 5000
REPORTER = spec
PROJECT_DIR = $(shell pwd)
SUPPORT_VERSIONS := \
	0.9.8 0.9.8-7 0.9.8-6 \
	0.9.9 0.9.9-8 0.9.9-7 \
	1.0.0 1.0.1 1.0.2 \
	1.1.0-beta

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

test-version:
	@for version in $(SUPPORT_VERSIONS); do \
		echo "test with mongodb@$$version"; \
		npm install mongodb@$$version --loglevel=warn; \
		$(MAKE) test REPORTER=progress; \
	done

.PHONY: test test-cov lib-cov
