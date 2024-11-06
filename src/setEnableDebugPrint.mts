import type {SetEnableDebugPrint} from "@fourtune/types/core/v1/"

let debug_print_enabled = false

const setEnableDebugPrint : SetEnableDebugPrint = function(
	enabled: boolean
) {
	debug_print_enabled = !!enabled
}

const getEnableDebugPrint = function() {
	return debug_print_enabled
}

export {setEnableDebugPrint, getEnableDebugPrint}
