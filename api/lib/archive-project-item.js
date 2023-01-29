// @ts-check

import { getStateWithProjectFields } from "./get-state-with-project-fields.js";
import { handleNotFoundGraphqlError } from "./handle-not-found-graphql-error.js";
import { archiveItemMutation } from "./queries.js";

/**
 * Helper method to archive an item from a project which is used
 * by all the `project.items.archive*` methods.
 *
 * @param {import("../..").default} project
 * @param {import("../..").GitHubProjectState} state
 * @param {string} itemNodeId
 *
 * @returns {Promise<void>}
 */
export async function archiveProjectItem(project, state, itemNodeId) {
  const stateWithFields = await getStateWithProjectFields(project, state);

  await project.octokit
    .graphql(archiveItemMutation, {
      projectId: stateWithFields.id,
      itemId: itemNodeId,
    })
    .catch(handleNotFoundGraphqlError);
}
