import type {
	Realm,
	LoadRealmDependencyResult,
	LoadRealmDependency
} from "@fourtune/types/core/v1/"

import path from "node:path"
import fs from "node:fs/promises"
import {getVersion} from "./getVersion.mts"

import {_loadDependenciesFile, realm_cache} from "./lib/_loadDependenciesFile.mts"
import {_getDependencyRootPath} from "./lib/_getDependencyRootPath.mts"

const loadRealmDependency : LoadRealmDependency = async function(
	project_root: string | "cli",
	realm: Realm,
	dependency_name: string
) : Promise<LoadRealmDependencyResult> {
	try {
		const tmp = await _loadDependenciesFile(project_root, realm)

		if (!(realm in realm_cache)) {
			throw new Error(`Unknown realm '${realm}'.`)
		}

		const cache = realm_cache[realm]

		if (cache.has(dependency_name)) {
			return cache.get(dependency_name) as LoadRealmDependencyResult
		}

		for (const dependency of tmp.dependencies) {
			if (dependency.name === dependency_name) {
				const dependency_path = _getDependencyRootPath(project_root, dependency.isolated, dependency.name)

				const ret : LoadRealmDependencyResult = {
					api_version: getVersion(),
					path: dependency_path,
					version: dependency.version,
					dependency: dependency.module,
					package_json: JSON.parse(
						(await fs.readFile(
							path.join(dependency_path, "package.json")
						)).toString()
					)
				}

				cache.set(dependency_name, ret)

				return ret
			}
		}

		throw new Error(`dependency not installed.`)
	} catch (error: any) {
		throw new Error(
			`Unable to load realm dependency '${dependency_name}'.\n` +
			`Error: ${error?.message}.\n`
		)
	}
}

export {loadRealmDependency}
