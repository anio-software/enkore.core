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
import {_debugPrint} from "./_debugPrint.mts"
import {spawnAsync} from "./spawnAsync.mts"

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
	await writeAtomicFileJSON(
		path.join(tmpDirPath, "package.json"),
		{
			name: "enkore-toolchain",
			version: "0.0.0",
			private: true,
			dependencies: {
				[toolchainID]: `0.0.${toolchainRev}`
			}
		},
		{pretty: true}
	)

	_debugPrint(`installing toolchain '${toolchainID}@${toolchainRev}'`)

	const {code} = await spawnAsync(
		npmBinaryPath,
		[
			"--no-package-lock",
			"install"
		], tmpDirPath
	)

	if (code !== 0) {
		throw new Error(
			`Failed to install toolchain '${toolchainID}@${toolchainRev}'.`
		)
	}
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
