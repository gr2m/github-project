// @ts-check

import { getItem } from "./items.get.js";
import { archiveProjectItem } from "./lib/archive-project-item.js";

/**
 * Archives an item if it exists. Resolves with the archived item
 * or with `undefined` if item was not found.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} itemNodeId
 *
 * @returns {Promise<import("..").GitHubProjectItem | undefined>}
 */
export async function archiveItem(project, state, itemNodeId) {
  const item = await getItem(project, state, itemNodeId);
  if (!item) return;

  if (item.isArchived) return item;

  await archiveProjectItem(project, state, item.id);
  return { ...item, isArchived: true };
}
