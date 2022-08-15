// @ts-check

import { getItemByContentRepositoryAndNumber } from "./items.get-by-content-repository-and-number.js";
import { getStateWithProjectFields } from "./lib/get-state-with-project-fields.js";
import { removeItemFromProjectMutation } from "./lib/queries.js";

/**
 * Removes an item if it exists. Resolves with `undefined` either way
 * In order to find an item by repository name and number, all items need to be loaded first.
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

  const stateWithFields = await getStateWithProjectFields(project, state);

  try {
    await project.octokit.graphql(removeItemFromProjectMutation, {
      projectId: stateWithFields.id,
      itemId: item.id,
    });
    return item;
  } catch (error) {
    /* c8 ignore next */
    if (!error.errors) throw error;
    if (error.errors[0].type === "NOT_FOUND") return;
    /* c8 ignore next 2 */
    throw error;
  }
}
