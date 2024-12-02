import {getEnableDebugPrint} from "../setEnableDebugPrint.mts"
import {getExactVersion} from "../getExactVersion.mts"

export function debugPrint(message: string) {
	if (!getEnableDebugPrint()) return

	const lines = message.split("\n")

	for (const line of lines) {
		process.stderr.write(
			`[@fourtune/core ${getExactVersion()} debug] ${line}\n`
		)
	}
}
