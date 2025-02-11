import type {
	NormalizedInstallSpec
} from "./normalizeDependencyInstallSpec.mts"

export function generateDependencyExportCode(
	dependency: NormalizedInstallSpec,
	sourcePath: string
) : string {
	if (dependency.importKind === "star") {
		return `export * from "${sourcePath}"\n`
	} else if (dependency.importKind === "named") {
		let ret = `export {\n`

		for (const entry in dependency.imports) {
			const exportAliasName = dependency.imports[entry] ?? entry

			if (exportAliasName === entry) {
				ret += `\t${entry},\n`
			} else {
				ret += `\t${entry} as ${exportAliasName},\n`
			}
		}

		// remove trailing ,\n
		ret = ret.slice(0, -2)

		ret += `\n} from "${sourcePath}"\n`

		return ret
	}

	return `export {default} from "${sourcePath}"\n`
}
