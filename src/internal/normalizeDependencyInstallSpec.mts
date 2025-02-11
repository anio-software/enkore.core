import type {
	EnkoreCoreRealmDependencyInstallSpecification
} from "@enkore/spec"
import {convertDependencyNameToFileName} from "./convertDependencyNameToFileName.mts"

export type NormalizedInstallSpec = {
	dependencyName: string
	fileNameFriendlyDependencyName: string
	identifier: string
	version: string
	isolated: boolean
	importKind: "default" | "named" | "star"
	imports: {
		[key: string]: string|undefined
	}
}

export function normalizeDependencyInstallSpec(
	dependencyName: string,
	spec: EnkoreCoreRealmDependencyInstallSpecification
) : NormalizedInstallSpec {
	let importKind : "default" | "named" | "star" = "default"
	const isolated = spec.isolated === true
	let imports = {}

	if (spec.importKind) importKind = spec.importKind

	if (spec.importKind === "named") {
		imports = spec.imports
	}

	return {
		dependencyName,
		fileNameFriendlyDependencyName: convertDependencyNameToFileName(dependencyName),
		identifier: `${dependencyName}@${spec.version}`,
		version: spec.version,
		isolated,
		importKind,
		imports
	}
}
