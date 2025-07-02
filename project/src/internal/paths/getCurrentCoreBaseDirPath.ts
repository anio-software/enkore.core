import path from "node:path"
import {getCoreBaseDirPath} from "./getCoreBaseDirPath.ts"

export function getCurrentCoreBaseDirPath(projectRoot: string) {
	return path.join(
		getCoreBaseDirPath(projectRoot), "v0"
	)
}
