import type {API} from "#~src/API.d.mts"

import {getProjectRootFromArgument} from "#~src/internal/getProjectRootFromArgument.mts"
import {readEnkoreConfigFile} from "@enkore/common"
import {initializeCore} from "#~src/internal/initializeCore.mts"
import {verifyRealmDependencyRequest} from "#~src/internal/verifyRealmDependencyRequest.mts"
import {getCurrentCoreBaseDirPath} from "#~src/internal/paths/getCurrentCoreBaseDirPath.mts"
import path from "node:path"
import type {RealmDependenciesExportObjectV0} from "#~src/internal/RealmDependenciesExportObjectV0.d.mts"

const impl : API["getInstalledTargetDependencyNames"] = async function(
	root,
	realmName
) {
	const projectRoot = await getProjectRootFromArgument(root)
	const projectConfig = await readEnkoreConfigFile(projectRoot)
	const coreData = await initializeCore(projectRoot, projectConfig)

	await verifyRealmDependencyRequest(projectConfig, coreData, realmName)

	const {default: dependenciesOnDisk} = await import(
		path.join(
			getCurrentCoreBaseDirPath(projectRoot),
			"dependencies",
			"index.mjs"
		)
	) as {default: RealmDependenciesExportObjectV0}

	return dependenciesOnDisk.realmDependencies.map(dependency => {
		return dependency.name
	})
}

export const getInstalledTargetDependencyNames = impl
