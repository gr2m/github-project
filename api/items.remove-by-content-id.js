// @ts-check

import { getStateWithProjectItems } from "./lib/get-state-with-project-items.js";
import { removeItemFromProjectMutation } from "./lib/queries.js";

/**
 * Removes an item if it exists. Resolves with `undefined` either way
 * In order to find an item by content ID, all items need to be loaded first.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} contentId
 * @returns {Promise<void>}
 */
export async function removeItemByContentId(project, state, contentId) {
  const stateWithItems = await getStateWithProjectItems(project, state);

  const existingItem = stateWithItems.items.find(
    // @ts-expect-error - does not handle the conditional chaining operator
    (item) => item.content?.id === contentId
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
