import type {NormalizedInstallSpec} from "../normalizeDependencyInstallSpec.mts"
import {writeAtomicFile} from "@aniojs/node-fs"
import {getDependencyDirPath} from "../paths/getDependencyDirPath.mts"
import {readDependencyPackageJSON} from "./readDependencyPackageJSON.mts"
import path from "node:path"

async function declareDependency(
	tmpDirPath: string,
	dependency: NormalizedInstallSpec,
	index: number
) : Promise<string> {
	const dependencyDirPath = getDependencyDirPath(dependency)

	const dependencyPackageJSON = await readDependencyPackageJSON(
		tmpDirPath, dependency
	)

	let ret = `exportObject.realmDependencies.push({\n`

	ret += `\tname: "${dependency.dependencyName}",\n`
	ret += `\trequestedVersion: "${dependency.version}",\n`
	ret += `\tactualVersion: "${dependencyPackageJSON.version}",\n`
	ret += `\tmoduleImportObject: dep_${index},\n`
	ret += `\tmodulePackageJSON: ${JSON.stringify(dependencyPackageJSON)},\n`
	ret += `\tisDefaultImport: ${dependency.importKind === "default" ? "true" : "false"},\n`
	ret += `\tpath: "${dependencyDirPath}"\n`

	ret += `})\n`

	return ret
}

export async function writeDependenciesImportFile(
	tmpDirPath: string,
	dependencies: NormalizedInstallSpec[]
) {
	let dependenciesImportCode = ``

	for (const [index, dependency] of dependencies.entries()) {
		const source = "./" + path.join(
			dependency.isolated ? "isolated" : "regular",
			dependency.fileNameFriendlyDependencyName,
			"index.mjs"
		)

		dependenciesImportCode += `import * as dep_${index} from "${source}"\n`
	}

	dependenciesImportCode += `\n`
	dependenciesImportCode += `const exportObject = {\n`
	dependenciesImportCode += `\trealmDependenciesExportObjectVersion: 0,\n`
	dependenciesImportCode += `\trealmDependencies: []\n`
	dependenciesImportCode += `}\n`
	dependenciesImportCode += `\n`

	for (const [index, dependency] of dependencies.entries()) {
		dependenciesImportCode += await declareDependency(tmpDirPath, dependency, index)
		dependenciesImportCode += `\n`
	}

	dependenciesImportCode += `export default exportObject\n`

	await writeAtomicFile(
		path.join(tmpDirPath, "index.mjs"), dependenciesImportCode
	)
}
