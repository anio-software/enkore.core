import {findProjectRootFromDirectory} from "../findProjectRootFromDirectory.mjs"
import {installRealmDependencies} from "../installRealmDependencies.mjs"
import {loadRealmDependency} from "../loadRealmDependency.mjs"

export default {
	getVersion() : number {
		return 1
	},

	findProjectRootFromDirectory,
	installRealmDependencies,
	loadRealmDependency
}
