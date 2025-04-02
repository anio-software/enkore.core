import {
	type EnkoreLockFile,
	readEntityJSONFile
} from "@enkore/spec"
import {getEnkoreLockFilePath} from "#~src/internal/paths/getEnkoreLockFilePath.mts"

export async function readLockFile(
	projectRoot: string
): Promise<EnkoreLockFile> {
	const lockfilePath = getEnkoreLockFilePath(projectRoot)

	return await readEntityJSONFile(
		lockfilePath, "EnkoreLockFile", 0, 0
	)
}
