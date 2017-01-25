if ($env:appveyor_repo_branch -ne 'master') {
	echo 'Skipping deployment, not on master branch'
} elseif (-not $env:APPVEYOR_REPO_TAG) {
	echo 'Skipping deployment, not a tagged commit'
} else {
	echo 'Deploying application...'
	node deployWindows.js
}
