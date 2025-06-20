import type {API} from "#~src/API.d.mts"
import {log} from "@anio-software/enkore-private.debug"
import {
	findProjectRootFromDirectory as findProjectRoot
} from "@anio-software/enkore-private.spec/utils"

const impl: API["findProjectRootFromDirectory"] = async function(
	startDirectory
) {
	const projectRoot = findProjectRoot(startDirectory)

	log(`findProjectRootFromDirectory: ${projectRoot}`)

	return projectRoot
}

export const findProjectRootFromDirectory = impl
