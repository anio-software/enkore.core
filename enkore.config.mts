import {defineConfig} from "@anio-software/enkore"
import {defineTargetOptions} from "@anio-software/enkore.target-js-node"

export const config: unknown = defineConfig({
	target: {
		name: "js-node",
		options: defineTargetOptions({
			_disableRuntimeCodeInjection: true,

			registry: {
				"anioSoftware": {
					url: "https://npm-registry.anio.software",
					authTokenFilePath: "secrets/anio_npm_auth_token",
					clientPrivateKeyFilePath: "secrets/npm_client.pkey",
					clientCertificateFilePath: "secrets/npm_client.cert"
				}
			},

			packageSourceRegistryByScope: {
				"@anio-software": {
					registry: "anioSoftware"
				}
			},

			exports: {
				"default": {
					checkAgainstInterface: [
						"@anio-software/enkore-private.spec",
						"EnkoreCoreAPI_V0_Rev0"
					]
				}
			},

			publish: [{
				registry: "anioSoftware"
			}]
		})
	}
})
