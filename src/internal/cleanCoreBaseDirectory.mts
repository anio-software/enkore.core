import {getCurrentCoreBaseDirPath} from "./paths/getCurrentCoreBaseDirPath.mts"
import fs from "node:fs/promises"
import {remove} from "@aniojs/node-fs"
import path from "node:path"
import {log} from "@enkore/debug"

export async function cleanCoreBaseDirectory(
	projectRoot: string
) {
	const coreDirPath = getCurrentCoreBaseDirPath(projectRoot)
	const entries = await fs.readdir(coreDirPath)

	for (const entry of entries) {
		if (entry.startsWith(".tmp_")) {
			log(`removing '${entry}'`)

			await remove(path.join(
				coreDirPath, entry
			))
		}
	}
}
