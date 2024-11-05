import {LoadRealmDependencyResult} from "@fourtune/types/core/v1/"
import {findProjectRootFromDirectory} from "./lib/findProjectRootFromDirectory.mts"
import path from "node:path"
import fs from "node:fs/promises"
import {checkProjectRoot} from "./lib/checkProjectRoot.mts"
import {getBaseDir} from "./lib/getBaseDir.mts"
import {convertPackageName} from "./lib/convertPackageName.mts"
import {calculateDependenciesIntegrity} from "./lib/calculateDependenciesIntegrity.mts"

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

		throw new Error(
			`Realm dependencies integrity check failed! <${h1} !== ${h2}>.`
		)
	}
}

export async function loadRealmDependency(
	project_root: string | "cli",
	realm: string,
	dependency_name: string
) : Promise<LoadRealmDependencyResult> {
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

	await checkProjectRoot(project_root)
	await verifyIntegrity(path.join(project_root, ".fourtune", getBaseDir()))

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

				return {
					path: dependency_path,
					version: dependency.version,
					dependency: dependency.module,
					package_json: JSON.parse(
						(await fs.readFile(
							path.join(dependency_path, "package.json")
						)).toString()
					)
				}
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
