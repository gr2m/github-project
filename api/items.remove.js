// @ts-check

import { getStateWithProjectItems } from "./lib/get-state-with-project-items.js";
import { removeItemFromProjectMutation } from "./lib/queries.js";

/**
 * Removes an item if it exists. Resolves with `undefined` either way
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} itemNodeId
 * @returns {Promise<void>}
 */
export async function removeItem(project, state, itemNodeId) {
  const stateWithItems = await getStateWithProjectItems(project, state);

  const existingItem = stateWithItems.items.find(
    (item) => item.id === itemNodeId
  );

  if (!existingItem) return;

  await project.octokit.graphql(removeItemFromProjectMutation, {
    projectId: stateWithItems.id,
    itemId: existingItem.id,
  });

  // update cache
  stateWithItems.items = stateWithItems.items.filter(
    (item) => item.id !== existingItem.id
  );
}
