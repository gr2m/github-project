// @ts-check

import { getItemByContentRepositoryAndNumber } from "./items.get-by-content-repository-and-number.js";
import { removeProjectItem } from "./lib/remove-project-item.js";

/**
 * Removes an item based on content repository name and number.
 * Resolves with the removed item or with `undefined` if item was not found.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} repositoryName
 * @param {number} issueOrPullRequestNumber
 *
 * @returns {Promise<import("..").GitHubProjectItem | undefined>}
 */
export async function removeItemByContentRepositoryAndNumber(
  project,
  state,
  repositoryName,
  issueOrPullRequestNumber
) {
  const item = await getItemByContentRepositoryAndNumber(
    project,
    state,
    repositoryName,
    issueOrPullRequestNumber
  );
  if (!item) return;

  await removeProjectItem(project, state, item.id);
  return item;
}
