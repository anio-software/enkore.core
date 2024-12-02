import type {
	Realm,
	_DependenciesFileExport,
	LoadRealmDependencyResult
} from "@fourtune/types/core/v1/"

import {findProjectRootFromDirectory} from "#~src/lib/findProjectRootFromDirectory.mts"
import path from "node:path"
import {checkProjectRoot} from "#~src/lib/checkProjectRoot.mts"
import {calculateDependenciesIntegrity} from "#~src/lib/calculateDependenciesIntegrity.mts"

import {getBaseDir} from "./getBaseDir.mts"
import {debugPrint} from "./debugPrint.mts"

import {getVersion} from "../getVersion.mts"

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

export const realm_cache : {
	[R in Realm]: Map<string, LoadRealmDependencyResult>
} = {
	"js": new Map(),
	"c": new Map(),
	"web": new Map()
}

let initial_checks_done = false

export async function _loadDependenciesFile(
	project_root: string | "cli",
	realm: Realm
) : Promise<_DependenciesFileExport> {
	if (!(realm in realm_cache)) {
		throw new Error(`Unknown realm '${realm}'.`)
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

	const tmp = await import(
		path.join(project_root, ".fourtune",
		getBaseDir(), "dependencies", "dependencies.mjs")
	)

	if (tmp.realm !== realm) {
		throw new Error(
			`Installed realm dependencies belong to a different realm.`
		)
	}
	else if (tmp.created_by_core_version !== getVersion()) {
		throw new Error(
			`You are trying to load dependencies that were created by a different version of @fourtune/core ` +
			`your version: ${getVersion()}, used version ${tmp.created_by_core_version}.\n`
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

	return tmp as _DependenciesFileExport
}
