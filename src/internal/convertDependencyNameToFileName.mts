export function convertDependencyNameToFileName(
	dependencyName: string
) : string {
	if (dependencyName.startsWith("@")) {
		const [org, packageName] = dependencyName.slice(1).split("/")

		return `org_${org}__${packageName}`
	}

	if (dependencyName.includes("/")) {
		throw new Error(`Invalid dependency name: ${dependencyName}.`)
	}

	return dependencyName
}
