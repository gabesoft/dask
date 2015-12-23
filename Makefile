default: test

MODULES = ./node_modules/.bin
MOCHA = $(MODULES)/mocha -u tdd --check-leaks -R mocha-better-spec-reporter
MPR = $(MODULES)/mpr
NODE_DEV = $(MODULES)/node-dev

MONGO_TEST_PORT = $(shell node -pe 'require("./config/test.json").mongo.port')
TESTS := $(shell find ./test/components -name '*.js' -not -path './test/support')

all: test

.PHONY: release test loc clean no_targets__ help

no_targets__:
help:
	@sh -c "$(MAKE) -rpn no_targets__ | awk -F':' '/^[a-zA-Z0-9][^\$$#\/\\t=]*:([^=]|$$)/ {split(\$$1,A,/ /);for(i in A)print A[i]}' | grep -v '__\$$' | grep -v 'Makefile' | grep -v 'make\[1\]' | sort"

serve:
	@$(NODE_DEV) server.js

run:
	@$(MPR) run mpr.json

start-test-mongo:
	@ulimit -n 2048 && \
	mongod --port $(MONGO_TEST_PORT) --dbpath /tmp --fork --logpath /tmp/mongo-test.log

stop-test-mongo:
	@mongo --port $(MONGO_TEST_PORT) admin --eval 'db.shutdownServer();'

test-mongo:
	-@NODE_ENV=test $(MOCHA) --grep @mongo $(TESTS) ./test/support/mongo-hooks.js

test-simple:
	-@NODE_ENV=test $(MOCHA) --grep @simple $(TESTS)

run-test-mongo: start-test-mongo test-mongo stop-test-mongo
run-test-simple: test-simple
run-test-all: run-test-simple run-test-mongo

lint:
	@eslint .

loc:
	@find src/ -name *.js | xargs wc -l

setup:
	@npm install . -d

clean-dep:
	@rm -rf node_modules
