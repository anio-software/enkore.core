import path from "node:path"
import {isFileSync} from "@aniojs/node-fs"
import {readEnkoreConfigFile} from "@enkore/common"
import {resolveImportSpecifierFromProjectRoot} from "@enkore/common"

async function checkIfEnkorePackageIsInstalled(
	projectRoot: string,
	packageName: string
) : Promise<boolean> {
	return await resolveImportSpecifierFromProjectRoot(
		projectRoot,
		`${packageName}/package.json`
	) !== false
}

export async function validateProjectRoot(
	projectRoot: string
) {
	if (!isFileSync(path.join(projectRoot, "enkore.config.mts"))) {
		throw new Error(
			`Invalid project root '${projectRoot}'.\n` + 
			`No enkore.config.mts found at project root.`
		)
	}

	const projectConfig = await readEnkoreConfigFile(projectRoot)

	// check for "enkore" package
	if (await checkIfEnkorePackageIsInstalled(projectRoot, `enkore`) === false) {
		throw new Error(
			`The 'enkore' package is not installed at the project root.\n` +
			`Please make sure you have it installed.`
		)
	}

	// check for enkore realm package
	const realmPackageName = `@enkore-target/${projectConfig.target._targetIdentifier}`

	if (await checkIfEnkorePackageIsInstalled(projectRoot, `${realmPackageName}`) === false) {
		throw new Error(
			`The '${realmPackageName}' package is not installed at the project root.\n` +
			`Please make sure you have it installed.`
		)
	}
}
