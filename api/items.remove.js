// @ts-check

import { getItem } from "./items.get.js";
import { removeProjectItem } from "./lib/remove-project-item.js";

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

  await removeProjectItem(project, state, item.id);
  return item;
}
