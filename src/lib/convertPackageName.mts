export function convertPackageName(name : string) {
	return name
		.split(`@`).join("--")
		.split(`/`).join("_") + ".pkg"
}
