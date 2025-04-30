import {
	type EnkoreConfig,
	type EnkoreCoreData,
	type ToolchainIDs
} from "@enkore/spec"

import {writeAtomicFileJSON, mkdirp, remove} from "@aniojs/node-fs"
import {getCoreDataFilePath} from "./paths/getCoreDataFilePath.mts"
import {updateLockFile} from "./updateLockFile.mts"
import {getCurrentCoreBaseDirPath} from "./paths/getCurrentCoreBaseDirPath.mts"
import {randomIdentifierSync} from "@aniojs/random-ident"
import path from "node:path"
import fs from "node:fs/promises"

export async function installToolchain(
	projectRoot: string,
	projectConfig: EnkoreConfig,
	coreData: EnkoreCoreData,
	toolchainID: ToolchainIDs,
	toolchainRev: number,
	npmBinaryPath: string
) {
	projectConfig; // unused var

	const tmpDirPath = path.join(
		getCurrentCoreBaseDirPath(projectRoot), `.tmp_${randomIdentifierSync(16)}`
	)

	await mkdirp(tmpDirPath)

	// -- ///

	// ---- //
	const destinationDirPath = path.join(
		getCurrentCoreBaseDirPath(projectRoot), "toolchain"
	)

	await remove(destinationDirPath)
	await fs.rename(tmpDirPath, destinationDirPath)

	// ---- //
	coreData.toolchainID = toolchainID
	coreData.toolchainRev = toolchainRev

	await writeAtomicFileJSON(
		getCoreDataFilePath(projectRoot),
		coreData,
		{pretty: true}
	)

	await updateLockFile(
		projectRoot,
		projectConfig,
		toolchainID,
		toolchainRev
	)
}
