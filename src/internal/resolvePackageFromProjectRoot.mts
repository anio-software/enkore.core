import {createRequire} from "node:module"
import path from "node:path"
import {_debugPrint} from "./_debugPrint.mts"

export async function resolvePackageFromProjectRoot(
	projectRoot: string,
	packageName: string
) : Promise<string|false> {
	// todo: use import.meta.resolve when second parameter
	// is not experimental anymore
	const require = createRequire(
		path.join(projectRoot, "index.js")
	)

	let result : string|boolean = false

	try {
		result = require.resolve(packageName)
	} catch {}

	_debugPrint(`resolvePackageFromProjectRoot: '${packageName}' resolved to '${result}'`)

	return result
}
