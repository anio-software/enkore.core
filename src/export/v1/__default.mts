import {getVersion} from "#~src/v1/getVersion.mjs"
import {setEnableDebugPrint} from "#~src/v1/setEnableDebugPrint.mts"
import {findProjectRootFromDirectory} from "#~src/v1/findProjectRootFromDirectory.mjs"
import {installRealmDependencies} from "#~src/v1/installRealmDependencies.mjs"
import {loadRealmDependency} from "#~src/v1/loadRealmDependency.mjs"

import type {DefaultExportObject} from "@fourtune/types/core/v1/"

const core = {
	getVersion,
	setEnableDebugPrint,
	findProjectRootFromDirectory,
	installRealmDependencies,
	loadRealmDependency
}

core satisfies DefaultExportObject

export default core
