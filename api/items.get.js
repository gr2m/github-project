// @ts-check

import { getStateWithProjectItems } from "./lib/get-state-with-project-items.js";

/**
 * Attempts to find an item based on the issues/pull request node id.
 * Returns undefined if item could not be found.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} itemId
 * @returns {Promise<import("..").GitHubProjectItem | undefined>}
 */
export async function getItem(project, state, itemId) {
  const stateWithItems = await getStateWithProjectItems(project, state);
  return stateWithItems.items.find((item) => item.id === itemId);
}
