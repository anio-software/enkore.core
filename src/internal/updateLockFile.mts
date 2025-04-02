import {writeAtomicFileJSON} from "@aniojs/node-fs"
import {getEnkoreLockFilePath} from "./paths/getEnkoreLockFilePath.mts"
import {
	type EnkoreConfig,
	type EnkoreLockFile
} from "@enkore/spec"
import type {InstalledDependency} from "./installTargetDependencies/InstalledDependency.d.mts"
import {readLockFile} from "./readLockFile.mts"

export async function updateLockFile(
	projectRoot: string,
	projectConfig: EnkoreConfig,
	installedDependencies: InstalledDependency[],
	targetDependenciesStamp: string
) {
	const lockFilePath = getEnkoreLockFilePath(projectRoot)

	//
	// we presume the enkore-lock.json file exists here
	// it should have been created by initializeProject() if it
	// didn't exist before (NB: only in non-CI mode)
	//
	const currentLockFileData = await readLockFile(projectRoot)

	currentLockFileData.targetIdentifier = projectConfig.target._targetIdentifier

	let targetDependencies : EnkoreLockFile["targetDependencies"] = {}

	for (const dependency of installedDependencies) {
		targetDependencies[dependency.name] = {
			version: dependency.version,
			requestedVersion: dependency.requestedVersion
		}
	}

	await writeAtomicFileJSON(
		lockFilePath, {
			...currentLockFileData,
			targetDependencies,
			targetDependenciesStamp
		}, {pretty: true}
	)
}
