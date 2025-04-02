import type {EnkoreConfig, EnkoreCoreData} from "@enkore/spec"
import type {TargetIdentifier} from "@enkore/primitives"
import {getCurrentPlatformString} from "./getCurrentPlatformString.mts"

export async function verifyRealmDependencyRequest(
	projectConfig: EnkoreConfig,
	coreData: EnkoreCoreData,
	targetIdentifier: TargetIdentifier
) {
	// todo: cross check with coreData.realm
	if (projectConfig.target._targetIdentifier !== targetIdentifier) {
		throw new Error(
			`Refusing to serve target dependency of a different realm:\n\n` +
			`Expected target: ${targetIdentifier}\n` +
			`Actual target  : ${projectConfig.target._targetIdentifier}\n\n` +
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
