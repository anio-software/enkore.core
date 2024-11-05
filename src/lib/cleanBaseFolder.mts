import fs from "node:fs/promises"
import path from "node:path"

export async function cleanBaseFolder(core_base_dir: string) {
	const entries = await fs.readdir(core_base_dir)

	for (const entry of entries) {
		if (!entry.startsWith(".tmp_")) continue

		await fs.rm(path.join(core_base_dir, entry), {
			recursive: true,
			force: true
		})
	}
}
