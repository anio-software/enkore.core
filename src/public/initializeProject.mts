import type {API} from "#~src/API.d.mts"

const impl: API["initializeProject"] = async function(
	root,
	isCIEnvironment,
	options?
) {
	return {} as any
}

export const initializeProject = impl
