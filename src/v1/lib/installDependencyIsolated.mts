import type {DependencyMapEntry} from "@fourtune/types/core/v1"

import {generateExportCode} from "./generateExportCode.mts"
import path from "node:path"
import fs from "node:fs/promises"
import {convertPackageName} from "#~src/lib/convertPackageName.mts"
import {spawnAsync} from "./spawnAsync.mts"

export async function installDependencyIsolated(
	index: number,
	tmp_path: string,
	dependency_name: string,
	dependency: DependencyMapEntry,
	npm_bin_path?: string|null
) : Promise<string> {
	const pkg_name = convertPackageName(dependency_name)
	const pkg_path = path.join(tmp_path, pkg_name)

	await fs.mkdir(pkg_path)

	const child = await spawnAsync(npm_bin_path ?? "npm", [
		"install",
		"--prefix",
		".",
		`${dependency_name}@${dependency.version}`
	], pkg_path)

	if (child.code !== 0) {
		throw new Error(`Failed to npm install ${dependency_name}@${dependency.version}.\n`)
	}

	await fs.writeFile(
		path.join(pkg_path, "index.mjs"), generateExportCode(dependency_name, dependency)
	)

	let ret = ``

	if (dependency.import_kind === "star" ||
		dependency.import_kind === "named") {
		ret += `import * as dependency_${index} from "./${pkg_name}/index.mjs"\n`
	} else {
		ret += `import dependency_${index} from "./${pkg_name}/index.mjs"\n`
	}

	ret += `\n`
	ret += `dependencies.push({\n`
	ret += `    name: ${JSON.stringify(dependency_name)},\n`
	ret += `    module: dependency_${index},\n`,
	ret += `    version: ${JSON.stringify(dependency.version)}\n`
	ret += `})\n`

	return ret
}
