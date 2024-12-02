import {getVersion} from "#~src/v1/getVersion.mjs"
import {getExactVersion} from "#~src/v1/getExactVersion.mjs"
import {setEnableDebugPrint} from "#~src/v1/setEnableDebugPrint.mts"
import {findProjectRootFromDirectory} from "#~src/v1/findProjectRootFromDirectory.mjs"
import {installRealmDependencies} from "#~src/v1/installRealmDependencies.mjs"
import {loadRealmDependency} from "#~src/v1/loadRealmDependency.mjs"
import {_getRealmDependencyNames} from "#~src/v1/_getRealmDependencyNames.mjs"

import type {DefaultExportObject} from "@fourtune/types/core/v1/"

const core = {
	getVersion,
	getExactVersion,
	setEnableDebugPrint,
	findProjectRootFromDirectory,
	installRealmDependencies,
	loadRealmDependency,
	_getRealmDependencyNames
}

core satisfies DefaultExportObject

export default core
