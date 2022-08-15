// @ts-check

import { getStateWithProjectFields } from "./lib/get-state-with-project-fields.js";
import { projectItemNodeToGitHubProjectItem } from "./lib/project-item-node-to-github-project-item.js";
import { getItemByContentIdQuery } from "./lib/queries.js";
import { handleNotFoundGraphqlError } from "./lib/handle-not-found-graphql-error.js";

/**
 * Attempts to find an item based on the issues/pull request node id.
 * Returns undefined if item could not be found.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} contentId
 *
 * @returns {Promise<import("..").GitHubProjectItem | undefined>}
 */
export async function getItemByContentId(project, state, contentId) {
  const stateWithFields = await getStateWithProjectFields(project, state);

  // TODO: ideally we would retrieve a project item directly based on a content id
  //       and the project number, but GitHub's GraphQL Schema does not support that
  //       as of 2022-08-14. As a workaround, we load all project items and filter
  //       them by project number afterwards.
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
