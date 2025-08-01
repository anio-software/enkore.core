import {
	type EnkoreCoreData,
	readEntityJSONFile,
	createEntity
} from "@anio-software/enkore-private.spec"
import {mkdirp, writeAtomicFileJSON} from "@anio-software/pkg.node-fs"
import {getCurrentCoreBaseDirPath} from "./paths/getCurrentCoreBaseDirPath.ts"
import {cleanCoreBaseDirectory} from "./cleanCoreBaseDirectory.ts"
import {getCoreDataFilePath} from "./paths/getCoreDataFilePath.ts"

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
