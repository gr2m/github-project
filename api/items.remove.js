// @ts-check

import { removeItemFromProjectMutation } from "./lib/queries.js";
import { getStateWithProjectFields } from "./lib/get-state-with-project-fields.js";

/**
 * Removes an item if it exists. Resolves with `undefined` either way
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} itemNodeId
 * @returns {Promise<void>}
 */
export async function removeItem(project, state, itemNodeId) {
  const stateWithFields = await getStateWithProjectFields(project, state);

  // update cache
  if (state.didLoadItems) {
    const existingItem = state.items.find((item) => item.id === itemNodeId);

    // if not found in cache, we assume it does not exist (anymore)
    if (!existingItem) return;
    state.items = state.items.filter((item) => item.id !== existingItem.id);
  }

  try {
    await project.octokit.graphql(removeItemFromProjectMutation, {
      projectId: stateWithFields.id,
      itemId: itemNodeId,
    });
  } catch (error) {
    if (!error.errors) throw error;
    if (error.errors[0].type === "NOT_FOUND") return;
    throw error;
  }
}
