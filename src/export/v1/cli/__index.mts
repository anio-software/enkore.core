import type {Realm} from "@fourtune/types/core/v1/"
import {installRealmDependencies} from "#~src/v1/installRealmDependencies.mts"
import {loadRealmDependency} from "#~src/v1/loadRealmDependency.mts"
import {_getRealmDependencyNames} from "#~src/v1/_getRealmDependencyNames.mjs"
import fs from "node:fs/promises"

const args = process.argv.slice(2)

if (args.length !== 4) {
	process.stderr.write(`Usage: <project_root> <realm> [--install <deps>|--load <dep>]\n`)
	process.exit(2)
}

const [project_root, realm, mode] = args

if (mode === "--install") {
	const dependencies_path = args[3]

	const tmp = await import(
		await fs.realpath(dependencies_path)
	)

	await installRealmDependencies(
		project_root, realm as Realm, tmp.default
	)
} else if (mode === "--load") {
	console.log(
		await _getRealmDependencyNames(project_root, realm as Realm)
	)

	console.log(
		await loadRealmDependency(
			project_root, realm as Realm, args[3]
		)
	)
}

export default 1
