import type {API} from "#~src/API.d.mts"

const impl : API["loadToolchain"] = function(
	projectRoot, toolchainID
) {
	return {} as any
}

export const loadToolchain = impl
