import path from "node:path"
import fs from "node:fs/promises"

export async function checkProjectRoot(project_root: string) {
	try {
		const stat = await fs.stat(
			path.join(project_root, "fourtune.config.mjs")
		)

		if (!stat.isFile()) {
			throw new Error
		}

		return await fs.realpath(project_root)
	} catch {
		throw new Error(
			`Unable to locate fourtune.config.mjs at the project root (${project_root}).`
		)
	}
}
