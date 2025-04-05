import type {API} from "#~src/API.d.mts"

import path from "node:path"
import {
	getProjectRootFromArgumentAndValidate,
	readEnkoreConfigFile
} from "@enkore/common"
import {initializeCore} from "#~src/internal/initializeCore.mts"
import {verifyTargetDependencyRequest} from "#~src/internal/verifyTargetDependencyRequest.mts"
import type {TargetDependenciesExportObjectV0} from "#~src/internal/TargetDependenciesExportObjectV0.d.mts"
import {getCurrentCoreBaseDirPath} from "#~src/internal/paths/getCurrentCoreBaseDirPath.mts"
import {createEntity} from "@enkore/spec"

const impl : API["loadTargetDependency"] = async function(
	root,
	targetIdentifier,
	dependencyName
) {
	const projectRoot = await getProjectRootFromArgumentAndValidate(root)
	const projectConfig = await readEnkoreConfigFile(projectRoot)
	const coreData = await initializeCore(projectRoot, projectConfig)

	await verifyTargetDependencyRequest(projectConfig, coreData, targetIdentifier)

	const {default: dependenciesOnDisk} = await import(
		path.join(
			getCurrentCoreBaseDirPath(projectRoot),
			"dependencies",
			"index.mjs"
		)
	) as {default: TargetDependenciesExportObjectV0}

	for (const dependency of dependenciesOnDisk.targetDependencies) {
		if (dependency.name === dependencyName) {
			let importedDependencyObject : unknown = dependency.moduleImportObject

			if (dependency.isDefaultImport) {
				importedDependencyObject = (dependency.moduleImportObject as any).default
			}

			return createEntity(
				"EnkoreCoreTargetDependency", 0, 0, {
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
		`Unable to locate target dependency '${dependencyName}'.`
	)
}

export const loadTargetDependency = impl
