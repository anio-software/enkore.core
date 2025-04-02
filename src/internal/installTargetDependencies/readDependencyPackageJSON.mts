import path from "node:path"
import type {NodePackageJSON} from "@enkore/primitives"
import type {NormalizedInstallSpec} from "../normalizeDependencyInstallSpec.mts"
import {getDependencyDirPath} from "../paths/getDependencyDirPath.mts"
import {readFileJSON} from "@aniojs/node-fs-file" // to be removed

export async function readDependencyPackageJSON(
	refDir: string,
	dependency: NormalizedInstallSpec
) : Promise<NodePackageJSON> {
	const dependencyDirPath = getDependencyDirPath(dependency)

	const dependencyPackageJSONPath = path.join(
		refDir,
		dependencyDirPath,
		"package.json"
	)

	return await readFileJSON(dependencyPackageJSONPath) as NodePackageJSON
}
