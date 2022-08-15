// @ts-check

import { getStateWithProjectFields } from "./lib/get-state-with-project-fields.js";
import { getFieldsUpdateQueryAndFields } from "./lib/get-fields-update-query-and-fields.js";
import { getItemByContentId } from "./items.get-by-content-id.js";

/**
 * Updates item fields if the item can be found.
 * In order to find an item by content ID, all items need to be loaded first.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} contentNodeId
 * @param {Record<string, string>} fields
 * @returns {Promise<import("..").GitHubProjectItem | undefined>}
 */
export async function updateItemByContentId(
  project,
  state,
  contentNodeId,
  fields
) {
  const item = await getItemByContentId(project, state, contentNodeId);
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
