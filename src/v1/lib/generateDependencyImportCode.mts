import {DependencyMapEntry} from "@fourtune/types/core/v1"

export function generateDependencyImportCode(
	identifier: string,
	source: string,
	dependency_name: string,
	dependency: DependencyMapEntry
) {
	let ret = ``

	if (dependency.import_kind === "star" ||
		dependency.import_kind === "named") {
		ret += `import * as ${identifier} from "${source}"\n`
	} else {
		ret += `import ${identifier} from "${source}"\n`
	}

	ret += `\n`
	ret += `dependencies.push({\n`
	ret += `    name: ${JSON.stringify(dependency_name)},\n`
	ret += `    module: ${identifier},\n`,
	ret += `    version: ${JSON.stringify(dependency.version)},\n`
	ret += `    isolated: ${dependency.isolated ? "true" : "false"}\n`
	ret += `})\n`

	return ret
}
