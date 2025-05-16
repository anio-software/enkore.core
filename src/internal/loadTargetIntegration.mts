import {
	type EnkoreTargetIntegrationAPI,
	type EnkoreConfig,
	importAPI
} from "@asint/enkore__spec"

import {resolveImportSpecifierFromProjectRoot} from "@asint/enkore__common"

export async function loadTargetIntegration(
	projectRoot: string,
	projectConfig: EnkoreConfig
) : Promise<EnkoreTargetIntegrationAPI> {
	const importPath = resolveImportSpecifierFromProjectRoot(
		projectRoot,
		`@enkore-target/${projectConfig.target.name}/targetIntegrationAPI`
	)

	if (importPath === false) {
		throw new Error(
			`Unable to locate target integration.\n` +
			`This should not happen and is therefore a bug inside enkore.`
		)
	}

	return await importAPI(
		importPath, "EnkoreTargetIntegrationAPI"
	)
}
