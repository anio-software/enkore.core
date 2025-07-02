import {
	type EnkoreCoreData,
	type ToolchainSpecifiers
} from "@anio-software/enkore-private.spec"
import path from "node:path"
import fs from "node:fs/promises"
import {writeAtomicFileJSON, writeAtomicFile, tmpfile, mkdirp, remove} from "@anio-software/pkg.node-fs"
import {getCoreDataFilePath} from "./paths/getCoreDataFilePath.ts"
import {formatToolchainSpecifier} from "./formatToolchainSpecifier.ts"
import {getCurrentCoreBaseDirPath} from "./paths/getCurrentCoreBaseDirPath.ts"
import {randomIdentifierSync} from "@anio-software/pkg.random-identifier"
import {spawnAsync} from "./spawnAsync.ts"
import {getCurrentPlatformString} from "./getCurrentPlatformString.ts"
import {_extractAnioSoftwareRegistryConfig} from "./_extractAnioSoftwareRegistryConfig.ts"
import {_updateLockFileToolchain} from "./_updateLockFileToolchain.ts"
import {log} from "@anio-software/enkore-private.debug"

const anioSoftwareRegistry = "npm-registry.anio.software"

export async function installToolchain(
	projectRoot: string,
	coreData: EnkoreCoreData,
	toolchain: ToolchainSpecifiers,
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
	let npmConfig = ""

	const {
		clientKeyFilePath,
		clientCertFilePath
	} = _extractAnioSoftwareRegistryConfig(
		anioSoftwareRegistry, projectRoot
	)

	if (clientKeyFilePath && clientCertFilePath) {
		npmConfig += `@anio-software:registry="https://${anioSoftwareRegistry}/"\n`
		npmConfig += `//${anioSoftwareRegistry}/:keyfile=${JSON.stringify(clientKeyFilePath)}\n`
		npmConfig += `//${anioSoftwareRegistry}/:certfile=${JSON.stringify(clientCertFilePath)}\n`
	} else {
		npmConfig = `registry="https://registry.npmjs.org/"\n`
	}

	await writeAtomicFileJSON(
		path.join(tmpDir, "package.json"),
		{
			name: "toolchain",
			version: "0.0.0",
			private: true,
			dependencies: {
				[`@anio-software/enkore-private.target-${toolchain[0]}-toolchain`]: `0.0.${toolchain[1]}`
			}
		},
		{pretty: true}
	)

	const tmpNPMConfigFilePath = await tmpfile()

	await writeAtomicFile(tmpNPMConfigFilePath, npmConfig, {
		createParents: false,
		mode: 0o600
	})

	const {code} = await spawnAsync(
		npmBinaryPath,
		[
			"--no-package-lock",
			"install",
			"--userconfig",
			tmpNPMConfigFilePath
		], tmpDir
	)

	await remove(tmpNPMConfigFilePath)

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
