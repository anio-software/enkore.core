import {
	type EnkoreConfig,
	readEntityJSONFile,
	type EnkoreCoreData,
	createEntity
} from "@enkore/spec"

import {_debugPrint} from "./_debugPrint.mts"
import {writeAtomicFileJSON, mkdirp, remove} from "@aniojs/node-fs"
import {getCurrentPlatformString} from "./getCurrentPlatformString.mts"
import {getCoreDataFilePath} from "./paths/getCoreDataFilePath.mts"
import {getCurrentCoreBaseDirPath} from "./paths/getCurrentCoreBaseDirPath.mts"
import path from "node:path"
import fs from "node:fs/promises"

async function cleanCoreDirectory(
	projectRoot: string
) {
	const debug = (msg: string) => _debugPrint(`cleanCoreDirectory: ${msg}.`)
	const coreDirPath = getCurrentCoreBaseDirPath(projectRoot)
	const entries = await fs.readdir(coreDirPath)

	for (const entry of entries) {
		if (entry.startsWith(".tmp_")) {
			debug(`removing '${entry}'`)

			await remove(path.join(
				coreDirPath, entry
			))
		}
	}
}

export async function initializeCore(
	projectRoot: string,
	projectConfig: EnkoreConfig
) : Promise<EnkoreCoreData> {
	await mkdirp(getCurrentCoreBaseDirPath(projectRoot))
	await cleanCoreDirectory(projectRoot)

	const coreDataFilePath = getCoreDataFilePath(projectRoot)

	const currentCoreData: EnkoreCoreData = await (async () => {
		const defaultCoreData = createEntity("EnkoreCoreData", 0, 0, {
			platform: getCurrentPlatformString(),
			targetIdentifier: projectConfig.target._targetIdentifier,
			targetDependenciesIntegrityHash: "",
			targetDependenciesStamp: ""
		})

		try {
			return await readEntityJSONFile(coreDataFilePath, "EnkoreCoreData", 0, 0)
		} catch (e) {
			return defaultCoreData
		}
	})()

	await writeAtomicFileJSON(
		coreDataFilePath,
		currentCoreData,
		{pretty: true}
	)

	return currentCoreData
}
