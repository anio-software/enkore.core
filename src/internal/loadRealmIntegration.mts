import {
	type EnkoreRealmIntegrationAPI,
	type EnkoreConfig,
	importAPI
} from "@enkore/spec"

import {resolvePackageFromProjectRoot} from "./resolvePackageFromProjectRoot.mts"

export async function loadRealmIntegration(
	projectRoot: string,
	projectConfig: EnkoreConfig
) : Promise<EnkoreRealmIntegrationAPI> {
	const importPath = await resolvePackageFromProjectRoot(
		projectRoot,
		`@enkore/realm-${projectConfig.realm.name}/realmIntegrationAPI`
	)

	if (importPath === false) {
		throw new Error(
			`Unable to locate realm integration.\n` +
			`This should not happen and is therefore a bug inside enkore.`
		)
	}

	return await importAPI(
		importPath, "EnkoreRealmIntegrationAPI"
	)
}
