import fs from "node:fs/promises"
import path from "node:path"

async function implementation(
	start_dir : string, debug_print = false
) {
	const entries = await fs.readdir(start_dir)

	if (debug_print) {
		console.log("findProjectRootFromDirectory", start_dir)
	}

	for (const entry of entries) {
		const absolute_path = path.join(start_dir, entry)
		const stat = await fs.lstat(absolute_path)

		if (entry === "fourtune.config.mjs" && stat.isFile()) {
			return path.dirname(absolute_path)
		}
	}

	if (start_dir !== "/") {
		return await implementation(path.resolve(start_dir, ".."), debug_print)
	}

	return false
}

export async function findProjectRootFromDirectory(
	start_dir : string, debug_print = false
) {
	const resolved = await fs.realpath(start_dir)

	return await implementation(resolved, debug_print)
}
