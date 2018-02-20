#!/bin/bash
set -e

# Travis doesn't allow specifying a list of scripts for deployment as it does elsewhere,
# so emulate that behaviour here.

yarn run deploy
yarn run deploy-changelog
