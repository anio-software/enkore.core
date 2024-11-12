import type {
	Realm,
	LoadRealmDependencyResult,
	LoadRealmDependency
} from "@fourtune/types/core/v1/"

import {findProjectRootFromDirectory} from "./lib/findProjectRootFromDirectory.mts"
import path from "node:path"
import fs from "node:fs/promises"
import {checkProjectRoot} from "./lib/checkProjectRoot.mts"
import {getBaseDir} from "./lib/getBaseDir.mts"
import {getVersion} from "./getVersion.mts"
import {convertPackageName} from "./lib/convertPackageName.mts"
import {calculateDependenciesIntegrity} from "./lib/calculateDependenciesIntegrity.mts"
import {debugPrint} from "./lib/debugPrint.mts"

async function verifyIntegrity(core_base_dir: string) {
	const actual_integrity = await calculateDependenciesIntegrity(
		path.join(core_base_dir, "dependencies")
	)

	const expected_integrity = (await import(
		path.join(core_base_dir, "dependencies_integrity.mjs")
	)).default

	if (actual_integrity !== expected_integrity) {
		const h1 = actual_integrity
		const h2 = expected_integrity

		const msg = `Realm dependencies integrity check failed! <${h1} !== ${h2}>.`

		if (!("FOURTUNE_CORE_DEBUG" in process.env)) {
			throw new Error(msg)
		} else {
			debugPrint(msg)
		}
	}
}

const realm_cache : {
	[R in Realm]: Map<string, LoadRealmDependencyResult>
} = {
	"js": new Map(),
	"c": new Map(),
	"web": new Map()
}

let initial_checks_done = false

const loadRealmDependency : LoadRealmDependency = async function(
	project_root: string | "cli",
	realm: Realm,
	dependency_name: string
) : Promise<LoadRealmDependencyResult> {
	if (!(realm in realm_cache)) {
		throw new Error(`Unknown realm '${realm}'.`)
	}

	const cache = realm_cache[realm]

	if (cache.has(dependency_name)) {
		return cache.get(dependency_name) as LoadRealmDependencyResult
	}

	if (project_root === "cli") {
		const tmp = await findProjectRootFromDirectory(
			path.dirname(process.argv[1])
		)

		if (tmp === false) {
			throw new Error(
				`Unable to determine the project root.\n` +
				`Make sure fourtune.config.mjs is in the project root.`
			)
		}

		project_root = tmp
	}

	if (!initial_checks_done) {
		debugPrint(`doing initial checks`)

		await checkProjectRoot(project_root)
		await verifyIntegrity(path.join(project_root, ".fourtune", getBaseDir()))

		initial_checks_done = true
	}

	try {
		const tmp = await import(
			path.join(project_root, ".fourtune",
			getBaseDir(), "dependencies", "dependencies.mjs")
		)

		if (tmp.realm !== realm) {
			throw new Error(
				`Installed realm dependencies belong to a different realm.`
			)
		}

		const expected_platform = tmp.platform
		const current_platform = `${process.arch}-${process.platform}`

		if (current_platform !== expected_platform) {
			throw new Error(
				`Refusing to serve realm dependencies that were produced on a different platform.\n` +
				`Expected platform: ${expected_platform}, your platform: ${current_platform}.\n` +
				`This can be fixed by re-installing @fourtune/realm-${realm} inside your project.`
			)
		}

		for (const dependency of tmp.dependencies) {
			if (dependency.name === dependency_name) {
				const dependency_path = path.join(
					project_root, ".fourtune",
					getBaseDir(), "dependencies",
					convertPackageName(dependency.name),
					"node_modules", dependency.name
				)

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
