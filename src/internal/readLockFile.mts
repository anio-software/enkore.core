import {
	type EnkoreLockFile,
	readEntityJSONFile
} from "@anio-software/enkore.spec"
import {getEnkoreLockFilePath} from "#~src/internal/paths/getEnkoreLockFilePath.mts"
import {log} from "@enkore/debug"

export async function readLockFile(
	projectRoot: string
): Promise<EnkoreLockFile> {
	log("readLockFile called")

	const lockfilePath = getEnkoreLockFilePath(projectRoot)

	return await readEntityJSONFile(
		lockfilePath, "EnkoreLockFile", 0, 0
	)
}
