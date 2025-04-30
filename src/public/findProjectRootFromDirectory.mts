import type {API} from "#~src/API.d.mts"
import {_debugPrint} from "#~src/internal/_debugPrint.mts"
import {
	findProjectRootFromDirectory as findProjectRoot
} from "@enkore/common"

const impl: API["findProjectRootFromDirectory"] = async function(
	startDirectory
) {
	const projectRoot = findProjectRoot(startDirectory)

	_debugPrint(`findProjectRootFromDirectory: ${projectRoot}`)

	return projectRoot
}

export const findProjectRootFromDirectory = impl
