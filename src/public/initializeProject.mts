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
import {_readLockFileOrCreateIt} from "#~src/internal/_readLockFileOrCreateIt.mts"

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

	return {} as any
}

export const initializeProject = impl
