// @ts-check

import { getItemByContentId } from "./items.get-by-content-id.js";
import { archiveProjectItem } from "./lib/archive-project-item.js";

/**
 * Archives an item based on content ID. Resolves with the archived item
 * or with `undefined` if item was not found.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} contentId
 *
 * @returns {Promise<import("..").GitHubProjectItem | undefined>}
 */
export async function archiveItemByContentId(project, state, contentId) {
  const item = await getItemByContentId(project, state, contentId);
  if (!item) return;

  if (item.isArchived) return item;

  await archiveProjectItem(project, state, item.id);
  return { ...item, isArchived: true };
}
