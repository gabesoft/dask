default: test

MODULES  = ./node_modules/.bin
MOCHA    = $(MODULES)/mocha -u tdd --check-leaks
MPR      = $(MODULES)/mpr
NODE_DEV = $(MODULES)/node-dev
VERSION  = $(shell node -pe 'require("./package.json").version')
TESTS		:= $(shell find ./test -name '*.js')

all: test

.PHONY: release test loc clean no_targets__ help

no_targets__:
help:
	@sh -c "$(MAKE) -rpn no_targets__ | awk -F':' '/^[a-zA-Z0-9][^\$$#\/\\t=]*:([^=]|$$)/ {split(\$$1,A,/ /);for(i in A)print A[i]}' | grep -v '__\$$' | grep -v 'Makefile' | grep -v 'make\[1\]' | sort"

tag:
	@git tag -a "v$(VERSION)" -m "Version $(VERSION)"

mongo:
	@mongod --config /usr/local/etc/mongod.conf

serve:
	@$(NODE_DEV) server.js

run:
	@$(MPR) run mpr.json

tag-push: tag
	@git push --tags origin HEAD:master

test:
	@NODE_ENV=test $(MOCHA) -R mocha-better-spec-reporter --grep @slow --invert $(TESTS)

test-slow:
	@NODE_ENV=test $(MOCHA) -R spec test/**/*.js --grep @slow --timeout 10000

test-all:
	@NODE_ENV=test $(MOCHA) -R spec test/**/*.js --timeout 10000

jshint:
	jshint .

loc:
	@find src/ -name *.js | xargs wc -l

setup:
	@npm install . -d

clean-dep:
	@rm -rf node_modules
