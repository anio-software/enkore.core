import {
	type EnkoreLockFile,
	readEntityJSONFile
} from "@enkore/spec"
import {getEnkoreLockFilePath} from "#~src/internal/paths/getEnkoreLockFilePath.mts"
import {_debugPrint} from "./_debugPrint.mts"

export async function readLockFile(
	projectRoot: string
): Promise<EnkoreLockFile> {
	_debugPrint("readLockFile called")

	const lockfilePath = getEnkoreLockFilePath(projectRoot)

	return await readEntityJSONFile(
		lockfilePath, "EnkoreLockFile", 0, 0
	)
}
