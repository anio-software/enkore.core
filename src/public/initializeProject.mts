import type {API} from "#~src/API.d.mts"
import type {EnkoreLockFile} from "@enkore/spec"

import {_debugPrint} from "#~src/internal/_debugPrint.mts"
import {getProjectRootFromArgument} from "#~src/internal/getProjectRootFromArgument.mts"
import {readEnkoreConfigFile} from "@enkore/common"
import {initializeCore} from "#~src/internal/initializeCore.mts"
import {loadTargetIntegration} from "#~src/internal/loadTargetIntegration.mts"
import {dependencyInstallSpecMapToStamp} from "#~src/internal/dependencyInstallSpecMapToStamp.mts"
import {dependencyInstallSpecMapToArray} from "#~src/internal/dependencyInstallSpecMapToArray.mts"
import {getEnkoreLockFilePath} from "#~src/internal/paths/getEnkoreLockFilePath.mts"
import {readEntityJSONFile} from "@enkore/spec"
import {installTargetDependencies} from "#~src/internal/installTargetDependencies.mts"
import {readEnkoreLockFileOrCreateIt} from "@enkore/common"

const impl : API["initializeProject"] = async function(
	root,
	isCIEnvironment,
	options?
) {
	let initialLockFile: EnkoreLockFile|null = null
	const debug = (msg: string) => _debugPrint(`initializeProject: ${msg}.`)

	const force = options?.force === true
	const npmBinaryPath = options?.npmBinaryPath || "npm"

	debug(`force parameter is ` + (force ? `set` : `not set`))
	debug(`isCIEnvironment parameter is ` + (isCIEnvironment ? `set` : `not set`))

	const projectRoot = await getProjectRootFromArgument(root)
	const projectConfig = await readEnkoreConfigFile(projectRoot)
	const coreData = await initializeCore(projectRoot, projectConfig)

	//
	// in non ci environment, create enkore-lock.json if it didn't exist already
	//
	if (!isCIEnvironment) {
		_debugPrint(`making sure enkore-lock.json exists`)

		initialLockFile = await readEnkoreLockFileOrCreateIt(
			projectRoot,
			projectConfig.target._targetIdentifier
		)
	}

	const targetIntegration = await loadTargetIntegration(projectRoot, projectConfig)
	const targetDependenciesToInstall = await targetIntegration.getDependenciesToInstall()
	const targetDependenciesToInstallStamp = dependencyInstallSpecMapToStamp(targetDependenciesToInstall)

	debug(`target dependencies to install stamp = '${targetDependenciesToInstallStamp}'`)
	debug(`installed target dependencies stamp = '${coreData.targetDependenciesStamp}'`)

	//
	// check early exit condition:
	//
	// - NOT in a CI environment
	// - force NOT set
	// - target dependencies stamps match up
	//
	if (!isCIEnvironment && !force && targetDependenciesToInstallStamp === coreData.targetDependenciesStamp) {
		debug(`stamps match up, doing early return`)

		return targetIntegration
	}

	//
	// check early error condition:
	//
	// - in CI environment
	// - lockfile stamps do not match up
	//
	if (isCIEnvironment) {
		//
		// in a CI environment we want to make sure
		// that the target dependencies stamp matches the one
		// saved in the enkore lockfile
		// if not, we throw an error and abort initializing the project
		//
		try {
			const lockfileData = await readEntityJSONFile(
				getEnkoreLockFilePath(projectRoot), "EnkoreLockFile"
			)

			if (lockfileData.targetDependenciesStamp !== targetDependenciesToInstallStamp) {
				throw new Error(
					`Target dependencies stamp inside enkore-lock.json does not match target dependencies to be installed.\n\n` +
					`Expected stamp          : ${targetDependenciesToInstallStamp}\n` +
					`Stamp saved in lockfile : ${lockfileData.targetDependenciesStamp}\n`
				)
			}

			initialLockFile = lockfileData
		} catch (error) {
			let errorReason = error instanceof Error ? error.message : "unknown"

			throw new Error(
				`There was an issue processing the enkore-lock.json lockfile.\n` +
				`In a CI environment, this is considered a fatal error.\n\n` +
				`Error: ${errorReason}\n\n` +
				`Please make sure to update and commit the enkore-lock.json lockfile.`
			)
		}
	}

	debug(`installing target dependencies`)

	await installTargetDependencies(
		projectRoot,
		projectConfig,
		coreData,
		dependencyInstallSpecMapToArray(targetDependenciesToInstall),
		targetDependenciesToInstallStamp,
		npmBinaryPath
	)

	if (initialLockFile === null) {
		throw new Error(`initialLockFile is null, should never get here!`)
	}

	return targetIntegration
}

export const initializeProject = impl
