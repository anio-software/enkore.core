import {getEnableDebugPrint} from "../setEnableDebugPrint.mts"

export function debugPrint(message: string) {
	if (!getEnableDebugPrint()) return

	const lines = message.split("\n")

	for (const line of lines) {
		process.stderr.write(
			`[@fourtune/core debug] ${line}\n`
		)
	}
}
