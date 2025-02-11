import type {API} from "#~src/API.d.mts"

import {_debugPrint} from "#~src/internal/_debugPrint.mts"
import {getProjectRootFromArgument} from "#~src/internal/getProjectRootFromArgument.mts"
import {readProjectConfigFile} from "#~src/internal/readProjectConfigFile.mts"
import {initializeCore} from "#~src/internal/initializeCore.mts"
import {loadRealmIntegration} from "#~src/internal/loadRealmIntegration.mts"
import {dependencyInstallSpecMapToStamp} from "#~src/internal/dependencyInstallSpecMapToStamp.mts"
import {dependencyInstallSpecMapToArray} from "#~src/internal/dependencyInstallSpecMapToArray.mts"
import {getEnkoreLockFilePath} from "#~src/internal/paths/getEnkoreLockFilePath.mts"
import {readEntityJSONFile} from "@enkore/spec"
import {installRealmDependencies} from "#~src/internal/installRealmDependencies.mts"

const impl : API["initializeProject"] = async function(
	root,
	isCIEnvironment,
	options?
) {
	const debug = (msg: string) => _debugPrint(`initializeProject: ${msg}.`)

	const force = options?.force === true
	const npmBinaryPath = options?.npmBinaryPath || "npm"

	debug(`force parameter is ` + (force ? `set` : `not set`))
	debug(`isCIEnvironment parameter is ` + (isCIEnvironment ? `set` : `not set`))

	const projectRoot = await getProjectRootFromArgument(root)
	const projectConfig = await readProjectConfigFile(projectRoot)
	const coreData = await initializeCore(projectRoot, projectConfig)

	const realmIntegration = await loadRealmIntegration(projectRoot, projectConfig)
	const realmDependenciesToInstall = await realmIntegration.getRealmDependenciesToInstall()
	const realmDependenciesToInstallStamp = dependencyInstallSpecMapToStamp(realmDependenciesToInstall)

	debug(`realm dependencies to install stamp = '${realmDependenciesToInstallStamp}'`)
	debug(`installed realm dependencies stamp = '${coreData.realmDependenciesStamp}'`)

	//
	// check early exit condition:
	//
	// - NOT in a CI environment
	// - force NOT set
	// - realm dependencies stamps match up
	//
	if (!isCIEnvironment && !force && realmDependenciesToInstallStamp === coreData.realmDependenciesStamp) {
		debug(`stamps match up, doing early return`)

		return realmIntegration
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
		// that the realm dependencies stamp matches the one
		// saved in the enkore lockfile
		// if not, we throw an error and abort initializing the project
		//
		try {
			const lockfileData = await readEntityJSONFile(
				getEnkoreLockFilePath(projectRoot), "EnkoreLockFile"
			)

			if (lockfileData.realmDependenciesStamp !== realmDependenciesToInstallStamp) {
				throw new Error(
					`Realm dependencies stamp inside enkore-lock.json does not match realm dependencies to be installed.\n\n` +
					`Expected stamp          : ${realmDependenciesToInstallStamp}\n` +
					`Stamp saved in lockfile : ${lockfileData.realmDependenciesStamp}\n`
				)
			}
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

	debug(`installing realm dependencies`)

	await installRealmDependencies(
		projectRoot,
		projectConfig,
		coreData,
		dependencyInstallSpecMapToArray(realmDependenciesToInstall),
		realmDependenciesToInstallStamp,
		npmBinaryPath
	)

	return realmIntegration
}

export const initializeProject = impl
