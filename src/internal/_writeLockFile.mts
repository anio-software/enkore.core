import {
	type EnkoreLockFile_V0_Rev0,
	type RawType,
	createEntity
} from "@enkore/spec"

import {getEnkoreLockFilePath} from "./paths/getEnkoreLockFilePath.mts"
import {writeAtomicFileJSON} from "@aniojs/node-fs"
import {_debugPrint} from "./_debugPrint.mts"

export async function _writeLockFile(
	projectRoot: string,
	lockfileData: RawType<EnkoreLockFile_V0_Rev0>
) {
	_debugPrint(`_writeLockFile called`)

	await writeAtomicFileJSON(
		getEnkoreLockFilePath(projectRoot), createEntity(
			"EnkoreLockFile", 0, 0, lockfileData
		), {pretty: true}
	)
}
