import {
	type EnkoreCoreData,
	readEntityJSONFile,
	createEntity
} from "@anio-software/enkore-private.spec"
import {mkdirp, writeAtomicFileJSON} from "@aniojs/node-fs"
import {getCurrentCoreBaseDirPath} from "./paths/getCurrentCoreBaseDirPath.mts"
import {cleanCoreBaseDirectory} from "./cleanCoreBaseDirectory.mts"
import {getCoreDataFilePath} from "./paths/getCoreDataFilePath.mts"

export async function initialize(
	projectRoot: string
): Promise<EnkoreCoreData> {
	await mkdirp(getCurrentCoreBaseDirPath(projectRoot))
	await cleanCoreBaseDirectory(projectRoot)

	const coreDataFilePath = getCoreDataFilePath(projectRoot)

	try {
		return await readEntityJSONFile(coreDataFilePath, "EnkoreCoreData", 0, 0)
	} catch (e) {
		const coreData = createEntity("EnkoreCoreData", 0, 0, {
			currentToolchain: false
		})

		await writeAtomicFileJSON(
			coreDataFilePath, coreData, {pretty: true}
		)

		return coreData
	}
}
