import {
	type EnkoreTargetIntegrationAPI,
	type EnkoreConfig,
	importAPI
} from "@asint/enkore__spec"

import {resolveImportSpecifierFromProjectRoot} from "@asint/enkore__common"

function getTargetIntegrationImportPath(
	projectRoot: string,
	projectConfig: EnkoreConfig
): {
	importPath: string|false
	namespace: "asint" | "enkore"
} {
	const asintImportPath = resolveImportSpecifierFromProjectRoot(
		projectRoot,
		`@asint/enkore-target__${projectConfig.target.name}/targetIntegrationAPI`
	)

	if (asintImportPath !== false) {
		return {
			importPath: asintImportPath,
			namespace: "asint"
		}
	}

	return {
		importPath: resolveImportSpecifierFromProjectRoot(
			projectRoot,
			`@enkore-target/${projectConfig.target.name}/targetIntegrationAPI`
		),
		namespace: "enkore"
	}
}

export async function loadTargetIntegration(
	projectRoot: string,
	projectConfig: EnkoreConfig
) : Promise<EnkoreTargetIntegrationAPI> {
	const {
		importPath,
		namespace
	} = getTargetIntegrationImportPath(projectRoot, projectConfig)

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
