import type {API} from "#~src/API.d.mts"
import {log} from "@enkore/debug"
import {
	findProjectRootFromDirectory as findProjectRoot
} from "@enkore/common"

const impl: API["findProjectRootFromDirectory"] = async function(
	startDirectory
) {
	const projectRoot = findProjectRoot(startDirectory)

	log(`findProjectRootFromDirectory: ${projectRoot}`)

	return projectRoot
}

export const findProjectRootFromDirectory = impl
