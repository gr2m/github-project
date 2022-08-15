// @ts-check

import { getItem } from "./items.get.js";
import { getFieldsUpdateQueryAndFields } from "./lib/get-fields-update-query-and-fields.js";
import { getStateWithProjectFields } from "./lib/get-state-with-project-fields.js";

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
  const item = await getItem(project, state, itemNodeId);
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
    itemId: itemNodeId,
  });

  return {
    ...item,
    fields: result.fields,
  };
}
