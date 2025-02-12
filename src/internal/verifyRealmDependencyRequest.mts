import type {EnkoreConfig, EnkoreCoreData} from "@enkore/spec"
import type {RealmName} from "@enkore/primitives"
import {getCurrentPlatformString} from "./getCurrentPlatformString.mts"

export async function verifyRealmDependencyRequest(
	projectConfig: EnkoreConfig,
	coreData: EnkoreCoreData,
	realmName: RealmName
) {
	// todo: cross check with coreData.realm
	if (projectConfig.realm.name !== realmName) {
		throw new Error(
			`Refusing to serve realm dependency of a different realm:\n\n` +
			`Expected realm: ${realmName}\n` +
			`Actual realm  : ${projectConfig.realm.name}\n\n` +
			`Please do a clean install of the realm dependencies.`
		)
	}

	const currentPlatform = getCurrentPlatformString()

	if (coreData.platform !== currentPlatform) {
		throw new Error(
			`Refusing to serve realm dependencies that were installed by a different platform:\n\n` +
			`Expected platform: ${coreData.platform}\n` +
			`Actual platform  : ${currentPlatform}\n\n` +
			`Please do a clean install of the realm dependencies.`
		)
	}
}
