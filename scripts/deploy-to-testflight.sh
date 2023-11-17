#!/bin/zsh

npm i
cd src/ui
npm i
cd ../../
npm run make:app-store
bundle exec fastlane deploy_to_testflight key_id:$APP_STORE_API_KEY_ID issuer_id:$APP_STORE_API_ISSUER_ID