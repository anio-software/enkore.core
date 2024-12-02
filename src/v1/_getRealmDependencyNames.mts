import type {Realm} from "@fourtune/types/core/v1"
import {_loadDependenciesFile} from "./lib/_loadDependenciesFile.mts"

export async function _getRealmDependencyNames(
	project_root: string,
	realm:  Realm
) : Promise<string[]> {
	if (project_root === "cli") {
		throw new Error(`project_root must not be "cli".`)
	}

	const tmp = await _loadDependenciesFile(project_root, realm)

	return tmp.dependencies.map(dependency => {
		return dependency.name
	})
}
