// @ts-check

import { getStateWithProjectItems } from "./lib/get-state-with-project-items.js";
import { getFieldsUpdateQuery } from "./lib/get-fields-update-query.js";
import { removeUndefinedValues } from "./lib/remove-undefined-values.js";

/**
 * Updates item fields if the item can be found and returns the full item
 * with all fields and content properties.
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
    itemId: itemNodeId,
  });

  item.fields = {
    ...item.fields,
    ...removeUndefinedValues(fields),
  };

  return item;
}
