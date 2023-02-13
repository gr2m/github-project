// @ts-check

import { projectNodeToProperties } from "./lib/project-node-to-properties.js";
import { getStateWithProjectFields } from "./lib/get-state-with-project-fields.js";

/**
 * Attempts to find an item based on the issues/pull request node id.
 * Resolves with undefined if item could not be found.
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
