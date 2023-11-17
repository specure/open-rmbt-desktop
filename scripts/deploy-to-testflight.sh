#!/bin/zsh

npm i
cd src/ui
npm i
cd ../../
npm run make:app-store
node scripts/deploy-to-testflight.js