export function defaultImportCode(dependency : string) {
	return `
import dependency from ${JSON.stringify(dependency)};
export default dependency;
`
}
