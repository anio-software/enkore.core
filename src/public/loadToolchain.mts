import type {API} from "#~src/API.d.mts"
import {
	getProjectRootFromArgumentAndValidate
} from "@enkore/common"
import {initialize} from "#~src/internal/initialize.mts"
import {getCurrentPlatformString} from "#~src/internal/getCurrentPlatformString.mts"
import path from "node:path"
import {getCurrentCoreBaseDirPath} from "#~src/internal/paths/getCurrentCoreBaseDirPath.mts"

const impl: API["loadToolchain"] = async function(
	root
) {
	const projectRoot = await getProjectRootFromArgumentAndValidate(root)
	const coreData = await initialize(projectRoot)

	if (!coreData.currentToolchain) {
		throw new Error(
			`You are running enkore without having a toolchain installed!`
		)
	}

	const expectedPlatform = coreData.currentToolchain.installedOnPlatform
	const currentPlatform = getCurrentPlatformString()

	if (expectedPlatform !== currentPlatform) {
		throw new Error(
			`Refusing to serve toolchain that was installed by a different platform:\n\n` +
			`Expected platform: ${expectedPlatform}\n` +
			`Actual platform  : ${currentPlatform}\n\n` +
			`Please do a clean install of the toolchain.`
		)
	}

	const toolchain = await import(
		path.join(
			getCurrentCoreBaseDirPath(projectRoot),
			"toolchain",
			"node_modules",
			coreData.currentToolchain.installedID,
			"dist",
			"default",
			"index.mjs"
		)
	)

	return {
		...toolchain,
		toolchainID: coreData.currentToolchain.installedID,
		toolchainRev: coreData.currentToolchain.installedRev
	}
}

export const loadToolchain: API["loadToolchain"] = impl
