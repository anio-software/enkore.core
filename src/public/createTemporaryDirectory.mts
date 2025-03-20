import path from "node:path"
import type {API} from "#~src/API.d.mts"
import {getCurrentCoreBaseDirPath} from "#~src/internal/paths/getCurrentCoreBaseDirPath.mts"
import {randomIdentifierSync} from "@aniojs/random-ident"
import {mkdirp} from "@aniojs/node-fs"

const impl: API["createTemporaryDirectory"] = async function(
	projectRoot
) {
	const tmpPath = path.join(
		getCurrentCoreBaseDirPath(projectRoot), `.tmp_${randomIdentifierSync(16)}`
	)

	await mkdirp(tmpPath)

	return tmpPath
}

export const createTemporaryDirectory = impl
