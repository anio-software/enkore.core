import {
	type EnkoreTargetIntegrationAPI,
	type EnkoreConfig,
	importAPI
} from "@enkore/spec"

import {resolveImportSpecifierFromProjectRoot} from "@enkore/common"

export async function loadTargetIntegration(
	projectRoot: string,
	projectConfig: EnkoreConfig
) : Promise<EnkoreTargetIntegrationAPI> {
	const importPath = await resolveImportSpecifierFromProjectRoot(
		projectRoot,
		`@enkore-target/${projectConfig.target._targetIdentifier}/realmIntegrationAPI`
	)

	if (importPath === false) {
		throw new Error(
			`Unable to locate realm integration.\n` +
			`This should not happen and is therefore a bug inside enkore.`
		)
	}

	return await importAPI(
		importPath, "EnkoreTargetIntegrationAPI"
	)
}
