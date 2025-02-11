import path from "node:path"
import {getCurrentCoreBaseDirPath} from "./getCurrentCoreBaseDirPath.mts"

export function getCoreDataFilePath(
	projectRoot: string
) {
	return path.join(
		getCurrentCoreBaseDirPath(projectRoot),
		"EnkoreCoreData.json"
	)
}
