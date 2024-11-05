import fs from "node:fs"
import {scandir} from "@anio-fs/scandir"
import {createHash} from "node:crypto"

export async function calculateDependenciesIntegrity(
	dir : string
) {
	const entries = await scandir(
		dir, {
			async filter(entry) {
				return entry.type === "regularFile"
			},
			sorted: true
		}
	) ?? []

	const files = entries.map(e => e.absolute_path)
	let hashes = ``

	for (const file of files) {
		hashes += createHash("md5").update(
			fs.readFileSync(file)
		).digest("hex") + "\n"
	}

	return createHash("md5").update(hashes).digest("hex")
}
