#!/bin/bash

# Travis doesn't allow specifying a list of scripts for deployment as it does elsewhere,
# so emulate that behaviour here.

status=0

yarn run deploy || status=1
yarn run deploy-changelog || status=1

exit $status
