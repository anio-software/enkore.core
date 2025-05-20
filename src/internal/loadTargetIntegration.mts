import {
	type EnkoreTargetIntegrationAPI,
	type EnkoreConfig,
	importAPI
} from "@anio-software/enkore-private.spec"

import {resolveImportSpecifierFromProjectRoot} from "@anio-software/enkore-private.common"

function getTargetIntegrationImportPath(
	projectRoot: string,
	projectConfig: EnkoreConfig
): {
	importPath: string|false
	namespace: "asint" | "enkore"
} {
	const anioSoftwareImportPath = resolveImportSpecifierFromProjectRoot(
		projectRoot,
		`@anio-software/enkore.target-${projectConfig.target.name}/targetIntegrationAPI`
	)

	if (anioSoftwareImportPath !== false) {
		return {
			importPath: anioSoftwareImportPath,
			namespace: "asint"
		}
	}

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
) : Promise<{
	targetIntegrationAPI: EnkoreTargetIntegrationAPI
	namespace: "asint" | "enkore"
}> {
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

	return {
		targetIntegrationAPI: await importAPI(
			importPath, "EnkoreTargetIntegrationAPI"
		),
		namespace
	}
}
