import fs from "node:fs/promises"

export async function ensureDirExists(dir: string) {
	await fs.mkdir(dir, {
		recursive: true
	})
}
