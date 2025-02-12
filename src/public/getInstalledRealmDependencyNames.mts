import type {API} from "#~src/API.d.mts"

import {getProjectRootFromArgument} from "#~src/internal/getProjectRootFromArgument.mts"
import {readProjectConfigFile} from "#~src/internal/readProjectConfigFile.mts"
import {initializeCore} from "#~src/internal/initializeCore.mts"
import {verifyRealmDependencyRequest} from "#~src/internal/verifyRealmDependencyRequest.mts"

const impl : API["getInstalledRealmDependencyNames"] = async function(
	root,
	realmName
) {
	const projectRoot = await getProjectRootFromArgument(root)
	const projectConfig = await readProjectConfigFile(projectRoot)
	const coreData = await initializeCore(projectRoot, projectConfig)

	await verifyRealmDependencyRequest(
		projectConfig, coreData, realmName
	)

	return []
}

export const getInstalledRealmDependencyNames = impl
