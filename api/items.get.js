// @ts-check

import { projectItemNodeToGitHubProjectItem } from "./lib/project-item-node-to-github-project-item.js";
import { getStateWithProjectFields } from "./lib/get-state-with-project-fields.js";
import { getItemQuery } from "./lib/queries.js";

/**
 * Attempts to find an item based on the issues/pull request node id.
 * Returns undefined if item could not be found.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} itemId
 *
 * @returns {Promise<import("..").GitHubProjectItem | undefined>}
 */
export async function getItem(project, state, itemId) {
  const stateWithFields = await getStateWithProjectFields(project, state);

  let result;
  try {
    result = await project.octokit.graphql(getItemQuery, {
      id: itemId,
    });
  } catch (error) {
    /* c8 ignore next */
    if (!error.errors) throw error;
    if (error.errors[0].type === "NOT_FOUND") return;
    /* c8 ignore next 2 */
    throw error;
  }

  if (!result.node.id) return;

  return projectItemNodeToGitHubProjectItem(stateWithFields, result.node);
}
