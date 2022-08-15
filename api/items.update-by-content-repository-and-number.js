// @ts-check

import { getItemByContentRepositoryAndNumber } from "./items.get-by-content-repository-and-number.js";
import { updateItemFields } from "./lib/update-project-item-fields.js";

/**
 * Updates item fields if the item can be found.
 * In order to find an item by content ID, all items need to be loaded first.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} repositoryName
 * @param {number} issueOrPullRequestNumber
 * @param {Record<string, string>} fields
 *
 * @returns {Promise<import("..").GitHubProjectItem | undefined>}
 */
export async function updateItemByContentRepositoryAndNumber(
  project,
  state,
  repositoryName,
  issueOrPullRequestNumber,
  fields
) {
  const item = await getItemByContentRepositoryAndNumber(
    project,
    state,
    repositoryName,
    issueOrPullRequestNumber
  );
  if (!item) return;

  const newFields = await updateItemFields(project, state, item.id, fields);
  if (!newFields) return item;

  return {
    ...item,
    fields: newFields,
  };
}
