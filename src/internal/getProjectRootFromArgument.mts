import {findProjectRootFromDirectory} from "#~src/public/findProjectRootFromDirectory.mts"
import path from "node:path"
import {validateProjectRoot} from "./validateProjectRoot.mts"

async function inferProjectRoot() : Promise<string> {
	const projectRoot = await findProjectRootFromDirectory(
		path.dirname(process.argv[1])
	)

	if (!projectRoot) {
		throw new Error(
			`Unable to infer project root from process argv[1].\n` +
			`Please check that your project contains 'enkore.config.mts'.\n` +
			`Path used to infer project root: '${process.argv[1]}'.`
		)
	}

	return projectRoot
}

export async function getProjectRootFromArgument(
	root: string | ["inferFromCLIArgs"]
) : Promise<string> {
	let projectRoot : string = root as string

	if (Array.isArray(root) && root[0] === "inferFromCLIArgs") {
		projectRoot = await inferProjectRoot()
	}

	await validateProjectRoot(projectRoot)

	return projectRoot
}
