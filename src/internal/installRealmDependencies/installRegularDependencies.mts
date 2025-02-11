import type {NormalizedInstallSpec} from "../normalizeDependencyInstallSpec.mts"
import {mkdirp, writeAtomicFile, writeAtomicFileJSON} from "@aniojs/node-fs"
import path from "node:path"
import {spawnAsync} from "../spawnAsync.mts"
import {generateDependencyExportCode} from "../generateDependencyExportCode.mts"
import {_debugPrint} from "../_debugPrint.mts"

export async function installRegularDependencies(
	tmpDirPath: string,
	dependencies: NormalizedInstallSpec[],
	npmBinaryPath: string
) {
	const debug = (msg: string) => _debugPrint(`installRegularDependencies: ${msg}.`)

	const packageJSON : {
		name: string
		version: string
		private: true
		dependencies: {[name: string]: string}
	} = {
		name: "enkore-realm-dependencies",
		version: "0.0.0",
		private: true,
		dependencies: {}
	}

	await mkdirp(path.join(tmpDirPath, "regular"))

	for (const dependency of dependencies) {
		const dependencyDirPath = path.join(
			tmpDirPath,
			"regular",
			dependency.fileNameFriendlyDependencyName
		)

		await mkdirp(dependencyDirPath)

		const exportCode = generateDependencyExportCode(dependency, dependency.dependencyName)

		await writeAtomicFile(
			path.join(dependencyDirPath, "index.mjs"), exportCode
		)

		packageJSON.dependencies[dependency.dependencyName] = dependency.version
	}

	await writeAtomicFileJSON(
		path.join(tmpDirPath, "regular", "package.json"),
		packageJSON,
		{pretty: true}
	)

	debug(`installing regular realm dependencies`)

	const {code} = await spawnAsync(
		npmBinaryPath, [
			"--no-package-lock",
			"install"
		], path.join(tmpDirPath, "regular")
	)

	if (code !== 0) {
		throw new Error(`Failed to install regular realm dependencies.`)
	}
}
