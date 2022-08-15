// @ts-check

import { getFieldsUpdateQueryAndFields } from "./get-fields-update-query-and-fields.js";
import { getStateWithProjectFields } from "./get-state-with-project-fields.js";

/**
 * @param {import("../..").default} project
 * @param {import("../..").GitHubProjectState} state
 * @param {string} itemNodeId
 * @param {Record<string, string>} fields
 *
 * @returns {Promise<import("../..").GitHubProjectItem["fields"] | undefined>}
 */
export async function updateItemFields(project, state, itemNodeId, fields) {
  const stateWithFields = await getStateWithProjectFields(project, state);

  const existingProjectFieldKeys = Object.keys(fields).filter(
    (key) => stateWithFields.fields[key].existsInProject
  );

  if (existingProjectFieldKeys.length === 0) return;

  const existingFields = Object.fromEntries(
    existingProjectFieldKeys.map((key) => [key, fields[key]])
  );

  const result = getFieldsUpdateQueryAndFields(stateWithFields, existingFields);

  await project.octokit.graphql(result.query, {
    projectId: stateWithFields.id,
    itemId: itemNodeId,
  });

  return result.fields;
}
