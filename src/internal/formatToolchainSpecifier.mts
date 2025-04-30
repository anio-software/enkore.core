export function formatToolchainSpecifier(
	specifier: [string, number]
) {
	return `${specifier[0]}@${specifier[1]}`
}
