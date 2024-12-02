import {spawn} from "node:child_process"

export function spawnAsync(
	cmd : string,
	args: string[],
	cwd: string
) : Promise<{code: number|null}> {
	const child = spawn(
		cmd, args, {
			stdio: "pipe",
			cwd
		}
	)

	return new Promise((resolve, reject) => {
		child.on("error", reject)

		child.on("exit", code => {
			resolve({code: code})
		})
	})
}
