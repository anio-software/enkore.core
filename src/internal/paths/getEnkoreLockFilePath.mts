import path from "node:path"

export function getEnkoreLockFilePath(projectRoot: string) {
	return path.join(projectRoot, "enkore-lock.json")
}
