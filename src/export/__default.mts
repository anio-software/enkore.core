import {getVersion} from "../getVersion.mjs"
import {setEnableDebugPrint} from "../setEnableDebugPrint.mts"
import {findProjectRootFromDirectory} from "../findProjectRootFromDirectory.mjs"
import {installRealmDependencies} from "../installRealmDependencies.mjs"
import {loadRealmDependency} from "../loadRealmDependency.mjs"

export default {
	getVersion,
	setEnableDebugPrint,
	findProjectRootFromDirectory,
	installRealmDependencies,
	loadRealmDependency
}
