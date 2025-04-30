import type {API} from "#~src/API.d.mts"
import type {
	ValidToolchainCombinations
} from "@enkore/spec"
import {
	getProjectRootFromArgumentAndValidate,
	readEnkoreConfigFile
} from "@enkore/common"
import {loadTargetIntegration} from "#~src/internal/loadTargetIntegration.mts"
import {formatToolchainSpecifier} from "#~src/internal/formatToolchainSpecifier.mts"
import {_debugPrint} from "#~src/internal/_debugPrint.mjs"

const impl: API["initializeProject"] = async function(
	root,
	isCIEnvironment,
	options?
) {
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

	return {} as any
}

export const initializeProject = impl
