//import type {DependencyMap} from "@fourtune/types/core/v1/"

import {defaultImportCode} from "#~src/lib/defaultImportCode.mts"
import path from "node:path"
import fs from "node:fs/promises"
import {convertPackageName} from "#~src/lib/convertPackageName.mts"
import {spawn} from "node:child_process"

function spawnAsync(
	cmd : string,
	args: string[],
	cwd: string
) : Promise<{code: number|null}> {
	const child = spawn(
		cmd, args, {
			stdio: "pipe",
			cwd
		}
	)

	return new Promise((resolve, reject) => {
		child.on("error", reject)

		child.on("exit", code => {
			resolve({code: code})
		})
	})
}

export async function installDependency(
	index: number,
	tmp_path: string,
	dependency_name: string,
	dependency: {
		version: string,
		import_code?: string|null
	},
	npm_bin_path?: string|null
) : Promise<string> {
	let import_code = defaultImportCode(dependency_name)

	if ("import_code" in dependency && dependency.import_code) {
		import_code = dependency.import_code
	}

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
		path.join(pkg_path, "index.mjs"), import_code
	)

	let ret = `import dependency_${index} from "./${pkg_name}/index.mjs"\n`

	ret += `\n`
	ret += `dependencies.push({\n`
	ret += `    name: ${JSON.stringify(dependency_name)},\n`
	ret += `    module: dependency_${index},\n`,
	ret += `    version: ${JSON.stringify(dependency.version)}\n`
	ret += `})\n`

	return ret
}
