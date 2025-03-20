import path from "node:path"
import type {API} from "#~src/API.d.mts"
import {getCurrentCoreBaseDirPath} from "#~src/internal/paths/getCurrentCoreBaseDirPath.mts"
import {randomIdentifierSync} from "@aniojs/random-ident"
import {writeAtomicFile} from "@aniojs/node-fs"

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
