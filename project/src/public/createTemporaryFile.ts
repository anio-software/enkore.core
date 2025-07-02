import path from "node:path"
import type {API} from "#~src/API.ts"
import {getCurrentCoreBaseDirPath} from "#~src/internal/paths/getCurrentCoreBaseDirPath.ts"
import {randomIdentifierSync} from "@anio-software/pkg.random-identifier"
import {writeAtomicFile} from "@anio-software/pkg.node-fs"

const impl: API["createTemporaryFile"] = async function(
	projectRoot, fileExtension = ""
) {
	const tmpPath = path.join(
		getCurrentCoreBaseDirPath(projectRoot), `.tmp_${randomIdentifierSync(16)}${fileExtension}`
	)

	await writeAtomicFile(tmpPath, "")

	return tmpPath
}

export const createTemporaryFile = impl
