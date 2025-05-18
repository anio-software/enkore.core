import {
	type EnkoreConfig,
	type EnkoreCoreData,
	type ValidToolchainCombinations
} from "@anio-software/enkore.spec"
import path from "node:path"
import fs from "node:fs/promises"
import {writeAtomicFileJSON, mkdirp, remove} from "@aniojs/node-fs"
import {getCoreDataFilePath} from "./paths/getCoreDataFilePath.mts"
import {formatToolchainSpecifier} from "./formatToolchainSpecifier.mts"
import {getCurrentCoreBaseDirPath} from "./paths/getCurrentCoreBaseDirPath.mts"
import {randomIdentifierSync} from "@aniojs/random-ident"
import {spawnAsync} from "./spawnAsync.mts"
import {getCurrentPlatformString} from "./getCurrentPlatformString.mts"
import {_updateLockFileToolchain} from "./_updateLockFileToolchain.mts"
import {log} from "@enkore/debug"

export async function installToolchain(
	projectRoot: string,
	coreData: EnkoreCoreData,
	toolchain: ValidToolchainCombinations,
	npmBinaryPath: string
) {
	log(
		`installing toolchain '${formatToolchainSpecifier(toolchain)}'`
	)

	const tmpDir = path.join(
		getCurrentCoreBaseDirPath(projectRoot),
		`.tmp_${randomIdentifierSync(16)}`
	)

	await mkdirp(tmpDir)
	// ---
	await writeAtomicFileJSON(
		path.join(tmpDir, "package.json"),
		{
			name: "toolchain",
			version: "0.0.0",
			private: true,
			dependencies: {
				[toolchain[0]]: `0.0.${toolchain[1]}`
			}
		},
		{pretty: true}
	)

	const {code} = await spawnAsync(
		npmBinaryPath,
		[
			"--no-package-lock",
			"install"
		], tmpDir
	)

	if (code !== 0) {
		throw new Error(
			`Failed to install toolchain '${formatToolchainSpecifier(toolchain)}'.`
		)
	}
	// ---
	const destinationDir = path.join(
		getCurrentCoreBaseDirPath(projectRoot), "toolchain"
	)

	await remove(destinationDir)
	await fs.rename(tmpDir, destinationDir)

	// ---- //
	coreData.currentToolchain = {
		installedID: toolchain[0],
		installedRev: toolchain[1],
		installedOnPlatform: getCurrentPlatformString()
	}

	await writeAtomicFileJSON(
		getCoreDataFilePath(projectRoot),
		coreData,
		{pretty: true}
	)

	await _updateLockFileToolchain(
		projectRoot,
		toolchain
	)
}
