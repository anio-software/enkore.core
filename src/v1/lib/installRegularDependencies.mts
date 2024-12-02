import type {DependencyMap} from "@fourtune/types/core/v1"

import {generateExportCode} from "./generateExportCode.mts"
import path from "node:path"
import fs from "node:fs/promises"
import {convertPackageName} from "#~src/lib/convertPackageName.mts"
import {spawnAsync} from "./spawnAsync.mts"
import {generateDependencyImportCode} from "./generateDependencyImportCode.mts"

export async function installRegularDependencies(
	tmp_path: string,
	dependencies: DependencyMap,
	npm_bin_path?: string|null
) : Promise<string> {
	let ret = ``

	const tmp_project_root = path.join(tmp_path, "regular")

	await fs.mkdir(tmp_project_root)

	let dependencies_package_json : {[key: string]: string} = {}

	for (const dependency_name in dependencies) {
		const dependency = dependencies[dependency_name]

		dependencies_package_json[dependency_name] = dependency.version

		await fs.writeFile(
			path.join(
				tmp_project_root, convertPackageName(dependency_name) + ".mjs"
			),
			generateExportCode(dependency_name, dependency)
		)
	}

	await fs.writeFile(
		path.join(tmp_project_root, "package.json"), JSON.stringify({
			private: true,
			name: "fourtune-realm-dependencies",
			version: "0.0.0",
			dependencies: dependencies_package_json
		}, undefined, 4)
	)

	const child = await spawnAsync(npm_bin_path ?? "npm", [
		"install",
		"."
	], tmp_project_root)

	if (child.code !== 0) {
		throw new Error(`Failed to npm install dependencies.\n`)
	}

	let index = 0

	for (const dependency_name in dependencies) {
		const dependency = dependencies[dependency_name]
		const pkg_name = convertPackageName(dependency_name)

		ret += generateDependencyImportCode(
			`__regular_dependency_${index}`,
			`./regular/${pkg_name}.mjs`,
			dependency_name,
			dependency
		)

		++index
	}

	return ret
}
