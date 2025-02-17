import type {API} from "#~src/API.d.mts"

import path from "node:path"
import {getProjectRootFromArgument} from "#~src/internal/getProjectRootFromArgument.mts"
import {readEnkoreConfigFile} from "@enkore/common"
import {initializeCore} from "#~src/internal/initializeCore.mts"
import {verifyRealmDependencyRequest} from "#~src/internal/verifyRealmDependencyRequest.mts"
import type {RealmDependenciesExportObjectV0} from "#~src/internal/RealmDependenciesExportObjectV0.d.mts"
import {getCurrentCoreBaseDirPath} from "#~src/internal/paths/getCurrentCoreBaseDirPath.mts"
import {createEntity} from "@enkore/spec"

const impl : API["loadRealmDependency"] = async function(
	root,
	realmName,
	dependencyName
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

	for (const dependency of dependenciesOnDisk.realmDependencies) {
		if (dependency.name === dependencyName) {
			let importedDependencyObject : unknown = dependency.moduleImportObject

			if (dependency.isDefaultImport) {
				importedDependencyObject = (dependency.moduleImportObject as any).default
			}

			return createEntity(
				"EnkoreCoreRealmDependency", 0, 0, {
					version: dependency.actualVersion,
					path: path.join(
						getCurrentCoreBaseDirPath(projectRoot),
						"dependencies",
						dependency.path
					),
					dependencyPackageJSON: dependency.modulePackageJSON,
					importedDependencyObject
				}
			)
		}
	}

	throw new Error(
		`Unable to locate realm dependency '${dependencyName}'.`
	)
}

export const loadRealmDependency = impl
