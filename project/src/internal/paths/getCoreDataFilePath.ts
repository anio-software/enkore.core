import path from "node:path"
import {getCurrentCoreBaseDirPath} from "./getCurrentCoreBaseDirPath.ts"

export function getCoreDataFilePath(
	projectRoot: string
) {
	return path.join(
		getCurrentCoreBaseDirPath(projectRoot),
		"EnkoreCoreData.json"
	)
}
