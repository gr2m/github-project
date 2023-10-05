// @ts-check

import { GitHubProjectInvalidValueError } from "../../index.js";
import { getFieldsUpdateQueryAndFields } from "./get-fields-update-query-and-fields.js";
import { getStateWithProjectFields } from "./get-state-with-project-fields.js";

/**
 * Helper method to update fields of a project item which is used
 * by all the `project.items.update*` methods.
 *
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

  try {
    await project.octokit.graphql(result.query, {
      projectId: stateWithFields.id,
      itemId: itemNodeId,
    });
  } catch (error) {
    const isInvalidValueError =
      error?.response?.errors?.[0]?.extensions?.code ===
      "argumentLiteralsIncompatible";

    /* c8 ignore next */
    if (!isInvalidValueError) throw error;

    const key = error.response.errors[0].path[1];
    const field = stateWithFields.fields[key];

    throw new GitHubProjectInvalidValueError({
      userValue: fields[key],
      field: {
        // @ts-expect-error
        id: field.id,
        // @ts-expect-error
        name: field.name,
        // @ts-expect-error
        type: field.dataType,
      },
    });
  }

  return result.fields;
}
