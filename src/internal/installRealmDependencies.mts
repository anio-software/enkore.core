import {
	type EnkoreConfig,
	type EnkoreCoreData
} from "@enkore/spec"

import type {NormalizedInstallSpec} from "./normalizeDependencyInstallSpec.mts"
import {writeAtomicFileJSON, mkdirp, remove} from "@aniojs/node-fs"
import {getCoreDataFilePath} from "./paths/getCoreDataFilePath.mts"
import {updateLockFile} from "./updateLockFile.mts"
import {getCurrentCoreBaseDirPath} from "./paths/getCurrentCoreBaseDirPath.mts"
import {randomIdentifierSync} from "@aniojs/random-ident"
import path from "node:path"
import fs from "node:fs/promises"
import {installIsolatedDependencies} from "./installTargetDependencies/installIsolatedDependencies.mts"
import {installRegularDependencies} from "./installTargetDependencies/installRegularDependencies.mts"
import {writeDependenciesImportFile} from "./installTargetDependencies/writeDependenciesImportFile.mts"
import type {InstalledDependency} from "./installTargetDependencies/InstalledDependency.d.mts"

export async function installRealmDependencies(
	projectRoot: string,
	projectConfig: EnkoreConfig,
	coreData: EnkoreCoreData,
	dependencies: NormalizedInstallSpec[],
	dependenciesStamp: string,
	npmBinaryPath: string
) {
	projectConfig; // unused var

	const tmpDirPath = path.join(
		getCurrentCoreBaseDirPath(projectRoot), `.tmp_${randomIdentifierSync(16)}`
	)

	await mkdirp(tmpDirPath)

	// -- ///
	const isolatedDependencies = dependencies.filter(dep => dep.isolated)
	const regularDependencies = dependencies.filter(dep => !dep.isolated)

	const installedDependencies : InstalledDependency[] = [
		...await installIsolatedDependencies(tmpDirPath, isolatedDependencies, npmBinaryPath),
		...await installRegularDependencies(tmpDirPath, regularDependencies, npmBinaryPath)
	]

	await writeDependenciesImportFile(tmpDirPath, dependencies)

	// ---- //
	const destinationDirPath = path.join(
		getCurrentCoreBaseDirPath(projectRoot), "dependencies"
	)

	await remove(destinationDirPath)
	await fs.rename(tmpDirPath, destinationDirPath)

	// ---- //
	coreData.targetDependenciesStamp = dependenciesStamp

	await writeAtomicFileJSON(
		getCoreDataFilePath(projectRoot),
		coreData,
		{pretty: true}
	)

	await updateLockFile(
		projectRoot,
		projectConfig,
		installedDependencies,
		dependenciesStamp
	)
}
