// @ts-check

import { getStateWithProjectItems } from "./lib/get-state-with-project-items.js";

/**
 * Find an item based on the repository and issues/pull request number.
 * Resolves with `undefined` if item could not be found.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} repositoryName
 * @param {number} issueOrPullRequestNumber
 * @returns {Promise<import("..").GitHubProjectItem | undefined>}
 */
export async function getItemByContentRepositoryAndNumber(
  project,
  state,
  repositoryName,
  issueOrPullRequestNumber
) {
  const stateWithItems = await getStateWithProjectItems(project, state);

  return stateWithItems.items.find((item) => {
    /* c8 ignore next */
    if (item.type === "DRAFT_ISSUE" || item.type === "REDACTED") return;

    return (
      item.content.repository === repositoryName &&
      item.content.number === issueOrPullRequestNumber
    );
  });
}
