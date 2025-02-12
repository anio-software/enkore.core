import type {NormalizedInstallSpec} from "../normalizeDependencyInstallSpec.mts"
import {mkdirp, writeAtomicFile, writeAtomicFileJSON} from "@aniojs/node-fs"
import path from "node:path"
import {spawnAsync} from "../spawnAsync.mts"
import {generateDependencyExportCode} from "../generateDependencyExportCode.mts"
import {_debugPrint} from "../_debugPrint.mts"
import type {InstalledDependency} from "./InstalledDependency.d.mts"
import {readDependencyPackageJSON} from "./readDependencyPackageJSON.mts"

export async function installIsolatedDependencies(
	tmpDirPath: string,
	dependencies: NormalizedInstallSpec[],
	npmBinaryPath: string
) : Promise<InstalledDependency[]> {
	const installedDependencies : InstalledDependency[] = []

	const debug = (msg: string) => _debugPrint(`installIsolatedDependencies: ${msg}.`)

	await mkdirp(path.join(tmpDirPath, "isolated"))

	for (const dependency of dependencies) {
		const dependencyDirPath = path.join(
			tmpDirPath,
			"isolated",
			dependency.fileNameFriendlyDependencyName
		)

		await mkdirp(dependencyDirPath)

		await writeAtomicFileJSON(
			path.join(dependencyDirPath, "package.json"),
			{
				name: "enkore-realm-dependency",
				version: "0.0.0",
				private: true,
				dependencies: {
					[dependency.dependencyName]: dependency.version
				}
			},
			{pretty: true}
		)

		const exportCode = generateDependencyExportCode(dependency, dependency.dependencyName)

		await writeAtomicFile(
			path.join(dependencyDirPath, "index.mjs"),
			exportCode
		)

		debug(`installing isolated realm dependency '${dependency.identifier}'`)

		const {code} = await spawnAsync(
			npmBinaryPath,
			[
				"--no-package-lock",
				"install"
			], dependencyDirPath
		)

		if (code !== 0) {
			throw new Error(
				`Failed to install isolated realm dependency '${dependency.identifier}'.`
			)
		}

		const dependencyPackageJSON = await readDependencyPackageJSON(
			tmpDirPath, dependency
		)

		installedDependencies.push({
			name: dependency.dependencyName,
			version: dependencyPackageJSON.version
		})
	}

	return installedDependencies
}
