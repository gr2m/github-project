// @ts-check

import { addIssueToProjectMutation } from "./lib/queries.js";
import { projectItemNodeToGitHubProjectItem } from "./lib/project-item-node-to-github-project-item.js";
import { getStateWithProjectFields } from "./lib/get-state-with-project-fields.js";
import { getFieldsUpdateQueryAndFields } from "./lib/get-fields-update-query-and-fields.js";
import { removeObjectKeys } from "./lib/remove-object-keys.js";

/**
 * Adds new item to project.
 *
 * @param {import("../").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} contentNodeId
 * @param {Record<string, string>} fields
 *
 * @returns {Promise<import("..").GitHubProjectItem>}
 */
export async function addItem(project, state, contentNodeId, fields) {
  const stateWithFields = await getStateWithProjectFields(project, state);

  const {
    addProjectV2ItemById: { item },
  } = await project.octokit.graphql(addIssueToProjectMutation, {
    projectId: stateWithFields.id,
    contentId: contentNodeId,
  });

  const newItem = projectItemNodeToGitHubProjectItem(stateWithFields, item);

  if (!fields) return newItem;

  const nonExistingProjectFields = Object.entries(stateWithFields.fields)
    .filter(([, field]) => field.existsInProject === false)
    .map(([key]) => key);
  const existingProjectFieldKeys = Object.keys(fields).filter(
    (key) => !nonExistingProjectFields.includes(key)
  );

  if (existingProjectFieldKeys.length === 0)
    return {
      ...newItem,
      // @ts-expect-error - complaints that built-in fields `title` and `status` might not exist, but we are good here
      fields: removeObjectKeys(newItem.fields, nonExistingProjectFields),
    };

  const existingFields = Object.fromEntries(
    existingProjectFieldKeys.map((key) => [key, fields[key]])
  );

  const result = getFieldsUpdateQueryAndFields(stateWithFields, existingFields);

  await project.octokit.graphql(result.query, {
    projectId: stateWithFields.id,
    itemId: newItem.id,
  });

  return {
    ...newItem,
    fields: result.fields,
  };
}
