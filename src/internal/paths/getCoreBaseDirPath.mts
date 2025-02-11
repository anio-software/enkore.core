import path from "node:path"

export function getCoreBaseDirPath(projectRoot: string) {
	return path.join(projectRoot, ".enkore", "core")
}
