import {
	type EnkoreLockFile_V0_Rev0,
	type RawType,
	createEntity
} from "@anio-software/enkore-private.spec"

import {getEnkoreLockFilePath} from "./paths/getEnkoreLockFilePath.ts"
import {writeAtomicFileJSON} from "@anio-software/pkg.node-fs"
import {log} from "@anio-software/enkore-private.debug"

export async function _writeLockFile(
	projectRoot: string,
	lockfileData: RawType<EnkoreLockFile_V0_Rev0>
) {
	log(`_writeLockFile called`)

	await writeAtomicFileJSON(
		getEnkoreLockFilePath(projectRoot), createEntity(
			"EnkoreLockFile", 0, 0, lockfileData
		), {pretty: true}
	)
}
