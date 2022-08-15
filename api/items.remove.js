// @ts-check

import { removeItemFromProjectMutation } from "./lib/queries.js";
import { getStateWithProjectFields } from "./lib/get-state-with-project-fields.js";
import { getItem } from "./items.get.js";

/**
 * Removes an item if it exists. Resolves with the removed item
 * or with `undefined` if item was not found.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} itemNodeId
 *
 * @returns {Promise<import("..").GitHubProjectItem | undefined>}
 */
export async function removeItem(project, state, itemNodeId) {
  const item = await getItem(project, state, itemNodeId);
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
