import type {NormalizedInstallSpec} from "../normalizeDependencyInstallSpec.mts"
import path from "node:path"

export function getDependencyDirPath(
	dependency: NormalizedInstallSpec
) {
	if (dependency.isolated) {
		return path.join(
			"isolated",
			dependency.fileNameFriendlyDependencyName,
			"node_modules",
			dependency.dependencyName
		)
	}

	return path.join(
		"regular",
		"node_modules",
		dependency.dependencyName
	)
}
