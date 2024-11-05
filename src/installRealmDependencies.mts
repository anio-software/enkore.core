import path from "node:path"
import type {DependencyMap} from "@fourtune/types/core/v1/"

import {getBaseDir} from "./lib/getBaseDir.mts"
import {checkProjectRoot} from "./lib/checkProjectRoot.mts"
import {ensureDirExists} from "./lib/ensureDirExists.mts"
import {cleanBaseFolder} from "./lib/cleanBaseFolder.mts"
import {defaultImportCode} from "./lib/defaultImportCode.mts"
import {createHash} from "node:crypto"
import {fileExists} from "./lib/fileExists.mts"
import {installRealmDependencies as impl} from "./lib/installRealmDependencies.mts"

function hashString(str: string) {
	return createHash("sha1").update(str).digest("hex")
}

function getDependenciesHash(
	dependencies : DependencyMap
) {
	// convert dependencies to an array so we can sort them
	const array = Object.keys(dependencies).map(dependency => {
		const definition = dependencies[dependency]

		let import_code : string = defaultImportCode(dependency)

		if ("import_code" in definition) {
			import_code = definition.import_code as string
		}

		return `${dependency}@${definition.version}:${import_code}`
	})

	array.sort((a, b) => {
		return a.length - b.length
	})

	return hashString(
		`${process.arch}:${process.platform}\n` +
		array.join("\n")
	)
}

export async function installRealmDependencies(
	project_root: string,
	realm: string,
	dependencies: DependencyMap,
	npm_bin_path?: string|null
) {
	// make sure project_root is pointing towards a fourtune project
	project_root = await checkProjectRoot(project_root)

	const core_base_dir = path.join(
		project_root, ".fourtune", getBaseDir()
	)

	await ensureDirExists(core_base_dir)
	await cleanBaseFolder(core_base_dir)

	const hash_file = path.join(core_base_dir, "dependencies", "hash.mjs")
	const current_hash = getDependenciesHash(dependencies)

	if ((await fileExists(hash_file))) {
		let hash_on_disk = "" 

		try {
			const tmp = await import(hash_file)
			hash_on_disk = tmp.default
		} catch {}


		if (hash_on_disk === current_hash) {
			return
		}
	}

	await impl(
		core_base_dir,
		realm,
		dependencies,
		current_hash,
		npm_bin_path
	)
}
