import type {API} from "#~src/API.d.mts"
import type {
	EnkoreLockFile,
	ValidToolchainCombinations
} from "@enkore/spec"
import {
	getProjectRootFromArgumentAndValidate,
	readEnkoreConfigFile
} from "@enkore/common"
import {loadTargetIntegration} from "#~src/internal/loadTargetIntegration.mts"
import {formatToolchainSpecifier} from "#~src/internal/formatToolchainSpecifier.mts"
import {_debugPrint} from "#~src/internal/_debugPrint.mjs"
import {initialize} from "#~src/internal/initialize.mts"
import {_readLockFileOrCreateIt} from "#~src/internal/_readLockFileOrCreateIt.mts"
import {getCurrentPlatformString} from "#~src/internal/getCurrentPlatformString.mts"

const impl: API["initializeProject"] = async function(
	root,
	isCIEnvironment,
	options?
) {
	let initialLockFile: EnkoreLockFile|null = null
	const force = options?.force === true
	const npmBinaryPath = options?.npmBinaryPath ?? "npm"

	const projectRoot = await getProjectRootFromArgumentAndValidate(root)
	const projectConfig = await readEnkoreConfigFile(projectRoot)

	const targetIntegrationAPI = await loadTargetIntegration(projectRoot, projectConfig)

	const toolchainToInstall: ValidToolchainCombinations = await (async () => {
		if (options?.forceToolchain) {
			return options?.forceToolchain
		} else if (projectConfig.target._toolchain) {
			return projectConfig.target._toolchain
		}

		return await targetIntegrationAPI.getToolchainToInstall()
	})()

	_debugPrint(`force parameter is ` + (force ? `set` : `not set`))
	_debugPrint(`isCIEnvironment parameter is ` + (isCIEnvironment ? `set` : `not set`))
	_debugPrint(`npmBinaryPath is '${npmBinaryPath}'`)

	_debugPrint(
		`toolchainToInstall is '${formatToolchainSpecifier(toolchainToInstall)}'`
	)

	const coreData = await initialize(projectRoot)

	//
	// in non ci environment, create enkore-lock.json if it didn't exist already
	//
	if (!isCIEnvironment) {
		_debugPrint(`making sure enkore-lock.json exists`)

		initialLockFile = await _readLockFileOrCreateIt(
			projectRoot,
			projectConfig.target.name,
			toolchainToInstall
		)
	}

	if (checkFirstEarlyExit()) {
		_debugPrint(`check first early exit was successfull`)

		return {} as any
	}

	return {} as any

	//
	// check early exit condition:
	//
	// - NOT in a CI environment
	// - force NOT set
	// - toolchain is installed and matches the requested one
	//
	function checkFirstEarlyExit() {
		const print = (str: string) => {
			_debugPrint(`checkFirstEarlyExit: ${str}`)
		}

		if (isCIEnvironment) {
			print(`isCIEnvironment is true`)
			return false
		} else if (force) {
			print(`force is true`)
			return false
		} else if (coreData.currentToolchain === false) {
			print(`no toolchain installed`)
			return false
		}

		const {currentToolchain} = coreData

		if (currentToolchain.installedOnPlatform !== getCurrentPlatformString()) {
			print(`platform does not match`)
			return false
		}

		if (currentToolchain.installedID !== toolchainToInstall[0]) {
			print(`toolchain id does not match`)
			return false
		}

		if (currentToolchain.installedRev !== toolchainToInstall[1]) {
			print(`toolchain rev does not match`)
			return false
		}

		return true
	}
}

export const initializeProject = impl
