import type {API} from "#~src/API.d.mts"
import process from "node:process"

let debugModeEnabled = false

const impl : API["setDebugMode"] = function(mode) {
	let oldMode = debugModeEnabled

	debugModeEnabled = mode

	return oldMode
}

export function _getDebugModeEnabled() {
	if ("ENKORE_CORE_DEBUG" in process.env) return true

	return debugModeEnabled
}

export const setDebugMode = impl
