import type {API} from "#~src/API.d.mts"

import path from "node:path"
import {getProjectRootFromArgument} from "#~src/internal/getProjectRootFromArgument.mts"
import {readProjectConfigFile} from "#~src/internal/readProjectConfigFile.mts"
import {initializeCore} from "#~src/internal/initializeCore.mts"
import {getCurrentPlatformString} from "#~src/internal/getCurrentPlatformString.mts"
import type {RealmDependenciesExportObjectV0} from "#~src/internal/RealmDependenciesExportObjectV0.d.mts"
import {getCurrentCoreBaseDirPath} from "#~src/internal/paths/getCurrentCoreBaseDirPath.mts"
import {createEntity} from "@enkore/spec"

const impl : API["loadRealmDependency"] = async function(
	root,
	realmName,
	dependencyName
) {
	const projectRoot = await getProjectRootFromArgument(root)
	const projectConfig = await readProjectConfigFile(projectRoot)
	const coreData = await initializeCore(projectRoot, projectConfig)

	if (projectConfig.realm.name !== realmName) {
		throw new Error(
			`Refusing to serve realm dependency of a different realm:\n\n` +
			`Expected realm: ${realmName}\n` +
			`Actual realm  : ${projectConfig.realm.name}\n\n` +
			`Please do a clean install of the realm dependencies.`
		)
	}

	const currentPlatform = getCurrentPlatformString()

	if (coreData.platform !== currentPlatform) {
		throw new Error(
			`Refusing to serve realm dependencies that were installed by a different platform:\n\n` +
			`Expected platform: ${coreData.platform}\n` +
			`Actual platform  : ${currentPlatform}\n\n` +
			`Please do a clean install of the realm dependencies.`
		)
	}

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
