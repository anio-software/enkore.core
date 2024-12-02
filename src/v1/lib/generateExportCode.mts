import type {
	DependencyMapEntry
} from "@fourtune/types/core/v1"

export function generateExportCode(
	source: string,
	dependency: DependencyMapEntry
) {
	if (dependency.import_kind === "star") {
		return `export * from "${source}"`
	} else if (dependency.import_kind === "named") {
		let ret = `export {\n`

		for (const entry in dependency.imports) {
			const aliased_name = dependency.imports[entry] ?? entry

			if (entry === aliased_name) {
				ret += `    ${entry},\n`
			} else {
				ret += `    ${entry} as ${aliased_name},\n`
			}
		}

		if (Object.keys(dependency.imports).length) {
			// remove trailing ","
			ret = ret.slice(0, -2) + "\n"
		}

		ret += `} from "${source}"\n`

		return ret
	}

	return `
import dependency from "${source}"
export default dependency
`.slice(1)
}
