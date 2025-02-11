import type {NodePackageJSON} from "@enkore/primitives"

export type RealmDependenciesExportObjectV0 = {
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
