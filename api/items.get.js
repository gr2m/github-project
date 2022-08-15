// @ts-check

import { projectItemNodeToGitHubProjectItem } from "./lib/project-item-node-to-github-project-item.js";
import { getStateWithProjectFields } from "./lib/get-state-with-project-fields.js";
import { getItemQuery } from "./lib/queries.js";
import { handleNotFoundGraphqlError } from "./lib/handle-not-found-graphql-error.js";

/**
 * Attempts to find an item based on the issues/pull request node id.
 * Resolves with undefined if item could not be found.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} itemId
 *
 * @returns {Promise<import("..").GitHubProjectItem | undefined>}
 */
export async function getItem(project, state, itemId) {
  const stateWithFields = await getStateWithProjectFields(project, state);

  const result = await project.octokit
    .graphql(getItemQuery, {
      id: itemId,
    })
    .catch(handleNotFoundGraphqlError);

  if (!result?.node.id) return;

  return projectItemNodeToGitHubProjectItem(stateWithFields, result.node);
}
