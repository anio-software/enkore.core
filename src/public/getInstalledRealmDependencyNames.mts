import type {API} from "#~src/API.d.mts"

const impl : API["getInstalledRealmDependencyNames"] = async function(
	root,
	realmName
) {
	return []
}

export const getInstalledRealmDependencyNames = impl
