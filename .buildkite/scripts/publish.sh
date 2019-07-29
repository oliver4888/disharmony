#!/bin/bash
npm ci
npm run build
npm config set //registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}
npm publish