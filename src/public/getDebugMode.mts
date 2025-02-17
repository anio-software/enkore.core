import type {API} from "#~src/API.d.mts"
import {_getDebugModeEnabled} from "./setDebugMode.mts"

const impl : API["getDebugMode"] = function() {
	return _getDebugModeEnabled()
}

export const getDebugMode = impl
