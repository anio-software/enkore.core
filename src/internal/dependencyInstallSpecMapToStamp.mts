import type {EnkoreCoreRealmDependencyInstallSpecification} from "@enkore/spec"
import type {NormalizedInstallSpec} from "./normalizeDependencyInstallSpec.mts"
import {dependencyInstallSpecMapToArray} from "./dependencyInstallSpecMapToArray.mts"
import {createHash} from "node:crypto"
import {getProjectPackageJSON} from "@fourtune/realm-js/v0/project"

function dependencyInstallSpecToString(
	spec: NormalizedInstallSpec
) : string {
	let ret = ""

	ret += spec.dependencyName
	ret += `;version=`
	ret += spec.version
	ret += `;importKind=`
	ret += spec.importKind
	ret += `;isolated=`
	ret += (spec.isolated ? "yes" : "no")

	if (Object.keys(spec.imports).length) {
		ret += `;importMap=`

		let importMap : [string, string][] = []

		//
		// this is done to create a stable (sorted) output string
		//
		for (const key in spec.imports) {
			const value = spec.imports[key]

			if (value === undefined) {
				importMap.push([key, "undefined"])
			} else {
				importMap.push([key, value])
			}
		}

		importMap.sort((a, b) => {
			return b[0].localeCompare(a[0], "en")
		})

		ret += importMap.map(([key, value]) => {
			return `${key}->${value}`
		}).join(",")
	} else {
		ret += `;importMap=empty`
	}

	return ret
}

export function dependencyInstallSpecMapToStamp(
	dependencyInstallSpecMap: {
		[dependencyName: string]: EnkoreCoreRealmDependencyInstallSpecification
	}
) : string {
	const asArray = dependencyInstallSpecMapToArray(dependencyInstallSpecMap)

	let tmp = asArray.map(dependencyInstallSpecToString)

	tmp.sort((a, b) => {
		return a.localeCompare(b, "en")
	})

	let ret = tmp.join("\n")

	return `${createHash("sha256").update(ret).digest("hex")}-${getProjectPackageJSON().version}`
}
