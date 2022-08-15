// @ts-check

import { getItemByContentId } from "./items.get-by-content-id.js";
import { removeProjectItem } from "./lib/remove-project-item.js";

/**
 * Removes an item based on content ID. Resolves with the removed item
 * or with `undefined` if item was not found.
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

  await removeProjectItem(project, state, item.id);
  return item;
}
