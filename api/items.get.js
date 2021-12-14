// @ts-check

import { getStateWithProjectItems } from "./lib/get-state-with-project-items.js";

/**
 * Attempts to find an item based on the issues/pull request node id.
 * Returns undefined if item could not be found.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @returns {Promise<import("..").GitHubProjectItem | undefined>}
 */
export default async function getItem(project, state, nodeId) {
  const stateWithItems = await getStateWithProjectItems(project, state);

  for (const item of stateWithItems.items) {
    if (item.isDraft === true) continue;
    if (item.issueOrPullRequest.id === nodeId) {
      return item;
    }
  }
}
