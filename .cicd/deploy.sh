#!/bin/bash -euf

if [[ "$RELEASE_VERSION" == vp* ]]; then
	npm publish --provenance --access public
else
	node ./.cicd/updatePackageName.mjs "@asint/enkore__core"

	npm publish --access public
fi
