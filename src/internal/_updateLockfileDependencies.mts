import type {
	EnkoreCoreTargetDependencyInstallSpecification
} from "@enkore/spec"

export async function _updateLockfileDependencies(
	projectRoot: string,
	dependencies: {
		[dependencyName: string]: EnkoreCoreTargetDependencyInstallSpecification
	}
): Promise<string> {
	return ""
}
