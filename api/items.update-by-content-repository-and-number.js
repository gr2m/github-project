// @ts-check

import { getStateWithProjectItems } from "./lib/get-state-with-project-items.js";
import { getFieldsUpdateQuery } from "./lib/get-fields-update-query.js";
import { removeUndefinedValues } from "./lib/remove-undefined-values.js";

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
  const stateWithItems = await getStateWithProjectItems(project, state);

  const item = stateWithItems.items.find((item) => {
    // TODO: remove ignore once we support draft items
    /* c8 ignore next */
    if (item.type === "DRAFT_ISSUE" || item.type === "REDACTED") return;

    return (
      item.content.repository === repositoryName &&
      item.content.number === issueOrPullRequestNumber
    );
  });

  if (!item) return;

  const existingProjectFieldKeys = Object.keys(fields).filter(
    (key) => stateWithItems.fields[key].existsInProject
  );

  if (existingProjectFieldKeys.length === 0) return item;

  const existingFields = Object.fromEntries(
    existingProjectFieldKeys.map((key) => [key, fields[key]])
  );

  const query = getFieldsUpdateQuery(stateWithItems, existingFields);
  await project.octokit.graphql(query, {
    projectId: stateWithItems.id,
    itemId: item.id,
  });

  // mutate item in cache
  item.fields = {
    ...item.fields,
    ...removeUndefinedValues(fields),
  };

  return item;
}
