// @ts-check

import { getStateWithProjectFields } from "./lib/get-state-with-project-fields.js";
import { getFieldsUpdateQueryAndFields } from "./lib/get-fields-update-query-and-fields.js";
import { getItemByContentRepositoryAndNumber } from "./items.get-by-content-repository-and-number.js";

/**
 * Updates item fields if the item can be found.
 * In order to find an item by content ID, all items need to be loaded first.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} repositoryName
 * @param {number} issueOrPullRequestNumber
 * @param {Record<string, string>} fields
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

  const stateWithFields = await getStateWithProjectFields(project, state);

  const existingProjectFieldKeys = Object.keys(fields).filter(
    (key) => stateWithFields.fields[key].existsInProject
  );

  if (existingProjectFieldKeys.length === 0) return item;

  const existingFields = Object.fromEntries(
    existingProjectFieldKeys.map((key) => [key, fields[key]])
  );

  const result = getFieldsUpdateQueryAndFields(stateWithFields, existingFields);

  await project.octokit.graphql(result.query, {
    projectId: stateWithFields.id,
    itemId: item.id,
  });

  return {
    ...item,
    fields: result.fields,
  };
}
