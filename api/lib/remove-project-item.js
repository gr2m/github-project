// @ts-check

import { getStateWithProjectFields } from "./get-state-with-project-fields.js";
import { handleNotFoundGraphqlError } from "./handle-not-found-graphql-error.js";
import { removeItemFromProjectMutation } from "./queries.js";

/**
 * @param {import("../..").default} project
 * @param {import("../..").GitHubProjectState} state
 * @param {string} itemNodeId
 *
 * @returns {Promise<void>}
 */
export async function removeProjectItem(project, state, itemNodeId) {
  const stateWithFields = await getStateWithProjectFields(project, state);

  await project.octokit
    .graphql(removeItemFromProjectMutation, {
      projectId: stateWithFields.id,
      itemId: itemNodeId,
    })
    .catch(handleNotFoundGraphqlError);
}
