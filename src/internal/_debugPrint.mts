import {_getDebugModeEnabled} from "#~src/public/setDebugMode.mts"
import process from "node:process"
import {getProjectPackageJSON} from "@fourtune/realm-js/v0/project"

export function _debugPrint(message: string) {
	if (!_getDebugModeEnabled()) return

	const packageJSON = getProjectPackageJSON()

	process.stderr.write(
		`debug ${packageJSON.name}: ${message}\n`
	)
}
