import path from "node:path"
import type {
	Realm,
	DependencyMap,
	DependenciesToInstall,
	InstallRealmDependencies,
	InstallRealmDependenciesOptions
} from "@fourtune/types/core/v1/"

import {getBaseDir} from "./lib/getBaseDir.mts"
import {checkProjectRoot} from "#~src/lib/checkProjectRoot.mts"
import {ensureDirExists} from "#~src/lib/ensureDirExists.mts"
import {cleanBaseFolder} from "#~src/lib/cleanBaseFolder.mts"
import {defaultImportCode} from "#~src/lib/defaultImportCode.mts"
import {createHash} from "node:crypto"
import {fileExists} from "#~src/lib/fileExists.mts"
import {findProjectRootFromDirectory} from "#~src/lib/findProjectRootFromDirectory.mts"
import {installRealmDependencies as impl} from "./lib/installRealmDependencies.mts"
import {getVersion} from "./getVersion.mts"
import {debugPrint} from "./lib/debugPrint.mts"
import {getExactVersion} from "./getExactVersion.mts"

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

const installRealmDependencies : InstallRealmDependencies = async function(
	project_root: string | "cli",
	realm: Realm,
	dependencies_to_install: DependenciesToInstall,
	{
		npm_bin_path = undefined,
		force = false
	} : InstallRealmDependenciesOptions = {}
) {
	if (dependencies_to_install.api_version !== getVersion()) {
		throw new Error(
			`Incompatible API version: requested version:` +
			` ${dependencies_to_install.api_version}, supported` +
			` version: ${getVersion()}.`
		)
	}

	const {dependencies} = dependencies_to_install

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

	// make sure project_root is pointing towards a fourtune project
	project_root = await checkProjectRoot(project_root)

	const core_base_dir = path.join(
		project_root, ".fourtune", getBaseDir()
	)

	await ensureDirExists(core_base_dir)
	await cleanBaseFolder(core_base_dir)

	const hash_file = path.join(core_base_dir, "dependencies", "hash.mjs")
	const current_hash = getDependenciesHash(dependencies) + `-${getExactVersion()}`

	if (!force && (await fileExists(hash_file))) {
		debugPrint(`hash of dependencies to be installed is '${current_hash}'.`)

		let hash_on_disk = "" 

		try {
			const tmp = await import(hash_file)
			hash_on_disk = tmp.default
		} catch {}

		debugPrint(`hash of dependencies on disk is '${hash_on_disk}'.`)

		if (hash_on_disk === current_hash) {
			return
		}
	}

	debugPrint(`installing dependencies.`)

	await impl(
		core_base_dir,
		realm,
		dependencies,
		current_hash,
		npm_bin_path
	)
}

export {installRealmDependencies}
