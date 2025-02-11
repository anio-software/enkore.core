import path from "node:path"
import type {API} from "#~src/API.d.mts"
import {_debugPrint} from "#~src/internal/_debugPrint.mts"
import {findNearestFile} from "@aniojs/node-fs"

const impl : API["findProjectRootFromDirectory"] = async function(
	startDirectory
) {
	const result = await findNearestFile("enkore.config.mts", startDirectory)

	if (result === false) return false

	const projectRoot = path.dirname(result)

	_debugPrint(`findProjectRootFromDirectory: ${projectRoot}`)

	return projectRoot
}

export const findProjectRootFromDirectory = impl
