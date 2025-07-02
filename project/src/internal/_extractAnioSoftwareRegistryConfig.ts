import {readFileStringSync} from "@anio-software/pkg.node-fs"
import path from "node:path"

export function _extractAnioSoftwareRegistryConfig(
	anioSoftwareRegistry: string,
	projectRoot: string
): {
	clientKeyFilePath: string|undefined
	clientCertFilePath: string|undefined
} {
	let clientKeyFilePath: string|undefined = undefined
	let clientCertFilePath: string|undefined = undefined

	const npmrc = readFileStringSync(path.join(projectRoot, ".npmrc"))
	const lines = npmrc.split("\n")

	for (const line of lines) {
		if (!line.startsWith(`//${anioSoftwareRegistry}`)) {
			continue
		}

		const tmp = line.slice(`//${anioSoftwareRegistry}`.length)
		const colonPos = tmp.indexOf(":")

		if (colonPos === -1) continue

		const configKVPair = tmp.slice(colonPos + 1)
		const equalPos = configKVPair.indexOf("=")

		if (equalPos === -1) continue

		const configKey = configKVPair.slice(0, equalPos)
		let configValue = configKVPair.slice(equalPos + 1)

		if (configValue.slice(0, 1) === '"' &&
			configValue.slice(-1) === '"') {
			configValue = configValue.slice(1, -1)
		}

		if (configKey === "keyfile") {
			clientKeyFilePath = path.join(projectRoot, configValue)
		} else if (configKey === "certfile") {
			clientCertFilePath = path.join(projectRoot, configValue)
		}
	}

	return {
		clientKeyFilePath,
		clientCertFilePath
	}
}
