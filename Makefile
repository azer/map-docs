module=main
target=test/*/*/.coffee

build-tests:
	@mkdir -p test/build
	@./node_modules/coffee-script/bin/coffee -o test/build/ -c test/.

test:
	@$(MAKE) build-tests -s
	@./node_modules/.bin/highkick test/build/$(module).js

.PHONY: test
