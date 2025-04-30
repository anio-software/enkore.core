import type {API} from "#~src/API.d.mts"
import {
	getProjectRootFromArgumentAndValidate
} from "@enkore/common"
import {initialize} from "#~src/internal/initialize.mts"
import {getCurrentPlatformString} from "#~src/internal/getCurrentPlatformString.mts"
import path from "node:path"
import {getCurrentCoreBaseDirPath} from "#~src/internal/paths/getCurrentCoreBaseDirPath.mts"

const impl: API["loadToolchain"] = async function(
	root, expectedToolchainID
) {
	const projectRoot = await getProjectRootFromArgumentAndValidate(root)
	const coreData = await initialize(projectRoot)

	if (!coreData.currentToolchain) {
		throw new Error(
			`You are running enkore without having a toolchain installed!`
		)
	} else if (coreData.currentToolchain.installedID !== expectedToolchainID) {
		throw new Error(
			`A toolchain is installed, but it's not the one requested/expected.`
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
		toolchainID: coreData.currentToolchain.installedID,
		toolchainRev: coreData.currentToolchain.installedRev,
		...toolchain
	}
}

export const loadToolchain = impl
