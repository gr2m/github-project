// @ts-check

import { projectNodeToProperties } from "./lib/project-node-to-properties.js";
import { getStateWithProjectFields } from "./lib/get-state-with-project-fields.js";

/**
 * Attempts to get a project's properties based on the owner and number.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 *
 * @returns {Promise<import("..").GitHubProjectProperties | undefined>}
 */
export async function getProperties(project, state) {
  const stateWithFields = await getStateWithProjectFields(project, state);

  return projectNodeToProperties(stateWithFields);
}
