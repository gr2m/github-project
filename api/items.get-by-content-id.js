// @ts-check

import { getStateWithProjectItems } from "./lib/get-state-with-project-items.js";

/**
 * Attempts to find an item based on the issues/pull request node id.
 * Returns undefined if item could not be found.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} contentId
 * @returns {Promise<import("..").GitHubProjectItem | undefined>}
 */
export async function getItemByContentId(project, state, contentId) {
  const stateWithItems = await getStateWithProjectItems(project, state);

  return stateWithItems.items.find(
    // @ts-expect-error `.content.id` does not exist on REDACTED items
    (item) => item.content.id === contentId
  );
}
