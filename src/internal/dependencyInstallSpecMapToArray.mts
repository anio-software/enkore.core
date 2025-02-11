import type {EnkoreCoreRealmDependencyInstallSpecification} from "@enkore/spec"

import {
	type NormalizedInstallSpec,
	normalizeDependencyInstallSpec
} from "./normalizeDependencyInstallSpec.mts"

export function dependencyInstallSpecMapToArray(
	dependencyInstallSpecMap: {
		[dependencyName: string]: EnkoreCoreRealmDependencyInstallSpecification
	}
) : NormalizedInstallSpec[] {
	let ret : NormalizedInstallSpec[] = []

	for (const dependencyName in dependencyInstallSpecMap) {
		ret.push(
			normalizeDependencyInstallSpec(
				dependencyName, dependencyInstallSpecMap[dependencyName]
			)
		)
	}

	//
	// make sure dependencies are sorted by name
	// this ensures the order inside the enkore lockfile stays consistent
	//
	ret.sort((a, b) => {
		return a.dependencyName.localeCompare(b.dependencyName, "en")
	})

	return ret
}
