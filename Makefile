BIN := node_modules/.bin

all: httprequest.d.ts index.js

$(BIN)/tsc:
	npm install

httprequest.d.ts: index.ts $(BIN)/tsc
	sed 's:^//// ::g' $< > module.ts
	$(BIN)/tsc --module commonjs --target ES5 --declaration module.ts
	sed 's:export declare module httprequest:declare module "httprequest":' <module.d.ts >$@
	rm module.{ts,d.ts,js}
