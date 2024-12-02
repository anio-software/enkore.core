import {getProjectPackageJSON} from "@fourtune/realm-js/project"

export function getExactVersion() : string {
	return getProjectPackageJSON().version
}
