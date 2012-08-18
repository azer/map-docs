module=main
target=test/*/*/.coffee

build-tests:
	@./node_modules/coffee-script/bin/coffee -c test

test:
	@$(MAKE) build-tests -s
	@./node_modules/.bin/highkick test/$(module).js

.PHONY: test
