import type {EnkoreConfig, EnkoreCoreData} from "@enkore/spec"
import type {TargetIdentifier} from "@enkore/spec/primitives"
import {getCurrentPlatformString} from "./getCurrentPlatformString.mts"

export async function verifyTargetDependencyRequest(
	projectConfig: EnkoreConfig,
	coreData: EnkoreCoreData,
	targetIdentifier: TargetIdentifier
) {
	// todo: cross check with coreData.targetIdentifier
	if (projectConfig.target._targetIdentifier !== targetIdentifier) {
		throw new Error(
			`Refusing to serve target dependency of a different target:\n\n` +
			`Expected target: ${targetIdentifier}\n` +
			`Actual target  : ${projectConfig.target._targetIdentifier}\n\n` +
			`Please do a clean install of the target dependencies.`
		)
	}

	const currentPlatform = getCurrentPlatformString()

	if (coreData.platform !== currentPlatform) {
		throw new Error(
			`Refusing to serve target dependencies that were installed by a different platform:\n\n` +
			`Expected platform: ${coreData.platform}\n` +
			`Actual platform  : ${currentPlatform}\n\n` +
			`Please do a clean install of the target dependencies.`
		)
	}
}
