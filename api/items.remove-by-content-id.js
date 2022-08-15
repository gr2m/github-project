// @ts-check

import { getItemByContentId } from "./items.get-by-content-id.js";
import { getStateWithProjectFields } from "./lib/get-state-with-project-fields.js";
import { removeItemFromProjectMutation } from "./lib/queries.js";

/**
 * Removes an item based on content ID if it exists. Resolves with
 * the removed item or with `undefined` if item was not found.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} contentId
 *
 * @returns {Promise<import("..").GitHubProjectItem | undefined>}
 */
export async function removeItemByContentId(project, state, contentId) {
  const item = await getItemByContentId(project, state, contentId);
  if (!item) return;

  const stateWithFields = await getStateWithProjectFields(project, state);

  try {
    await project.octokit.graphql(removeItemFromProjectMutation, {
      projectId: stateWithFields.id,
      itemId: item.id,
    });
    return item;
  } catch (error) {
    /* c8 ignore next */
    if (!error.errors) throw error;
    if (error.errors[0].type === "NOT_FOUND") return;
    /* c8 ignore next 2 */
    throw error;
  }
}
