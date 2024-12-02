import path from "node:path"
import {getBaseDir} from "./getBaseDir.mts"
import {convertPackageName} from "#~src/lib/convertPackageName.mts"

export function _getDependencyRootPath(
	project_root: string,
	isolated: boolean,
	dependency_name: string
) : string {
	if (isolated) {
		return path.join(
			project_root, ".fourtune",
			getBaseDir(), "dependencies",
			"_isolated",
			convertPackageName(dependency_name),
			"node_modules", dependency_name
		)
	}

	return path.join(
		project_root, ".fourtune",
		getBaseDir(), "dependencies",
		"regular",
		"node_modules", dependency_name
	)
}
