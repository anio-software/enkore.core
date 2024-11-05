import {installRealmDependencies} from "#~src/installRealmDependencies.mjs"
import fs from "node:fs/promises"

const args = process.argv.slice(2)

if (args.length !== 3) {
	process.stderr.write(`Usage: <project_root> <realm> <dependencies.mjs>\n`)
	process.exit(2)
}

const [project_root, realm, dependencies_path] = args

const tmp = await import(
	await fs.realpath(dependencies_path)
)

await installRealmDependencies(
	project_root, realm, tmp.default
)

export default 1
