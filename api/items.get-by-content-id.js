// @ts-check

import { getStateWithProjectFields } from "./lib/get-state-with-project-fields.js";
import { projectItemNodeToGitHubProjectItem } from "./lib/project-item-node-to-github-project-item.js";
import { getItemByContentIdQuery } from "./lib/queries.js";
import { handleNotFoundGraphqlError } from "./lib/handle-not-found-graphql-error.js";

/**
 * Attempts to find an item based on the issues/pull request node id.
 * Resolves with undefined if item could not be found.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} contentId
 *
 * @returns {Promise<import("..").GitHubProjectItem | undefined>}
 */
export async function getItemByContentId(project, state, contentId) {
  const stateWithFields = await getStateWithProjectFields(project, state);

  const result = await project.octokit
    .graphql(getItemByContentIdQuery, {
      id: contentId,
    })
    .catch(handleNotFoundGraphqlError);

  const node = result?.node.projectItems?.nodes.find(
    (node) => node.project.number === project.number
  );

  // TODO: add test where an item is added to two projects in order to cover the line below
  /* c8 ignore next */
  if (!node) return;

  return projectItemNodeToGitHubProjectItem(stateWithFields, node);
}
