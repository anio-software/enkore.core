import {findProjectRootFromDirectory as impl} from "./lib/findProjectRootFromDirectory.mts"

export async function findProjectRootFromDirectory(
	start_directory: string
) : Promise<string|false> {
	return await impl(start_directory)
}
