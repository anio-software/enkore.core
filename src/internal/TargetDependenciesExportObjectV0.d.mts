import type {NodePackageJSON} from "@enkore/primitives"

export type TargetDependenciesExportObjectV0 = {
	realmDependencies: {
		name: string
		requestedVersion: string
		actualVersion: string
		moduleImportObject: unknown
		modulePackageJSON: NodePackageJSON
		isDefaultImport: boolean
		path: string
	}[]
}
