// @ts-check

import { getStateWithProjectItems } from "./lib/get-state-with-project-items.js";
import { getFieldsUpdateQuery } from "./lib/get-fields-update-query.js";
import { removeUndefinedValues } from "./lib/remove-undefined-values.js";

/**
 * Updates item fields if the item can be found.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} itemNodeId
 * @param {Record<string, string>} fields
 * @returns {Promise<import("..").GitHubProjectItem | undefined>}
 */
export async function updateItem(project, state, itemNodeId, fields) {
  const stateWithItems = await getStateWithProjectItems(project, state);

  const item = stateWithItems.items.find((item) => item.id === itemNodeId);

  if (!item) return;

  const query = getFieldsUpdateQuery(stateWithItems, fields);
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
