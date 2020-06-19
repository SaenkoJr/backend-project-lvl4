setup:
	yarn install

build:
	yarn run build

prepare:
	touch .env

start:
	heroku local -f Procfile.dev

start-backend:
	npx nodemon --exec npx babel-node server/bin/server.js

start-frontend:
	npx webpack-dev-server

lint:
	npx eslint .

test:
	yarn run test

test-watch:
	yarn run test --watchAll

test-coverage:
	yarn run test --coverage --detectOpenHandles

migrations-setup:
	yarn typeorm schema:drop
	yarn typeorm migration:generate -n Updated
	yarn migration:run

.PHONY: test
