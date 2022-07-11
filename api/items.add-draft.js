// @ts-check

import { addIssueToProjectMutation } from "./lib/queries.js";
import { projectItemNodeToGitHubProjectItem } from "./lib/project-item-node-to-github-project-item.js";
import { getStateWithProjectFields } from "./lib/get-state-with-project-fields.js";
import { getFieldsUpdateQuery } from "./lib/get-fields-update-query.js";
import { removeUndefinedValues } from "./lib/remove-undefined-values.js";
import { removeObjectKeys } from "./lib/remove-object-keys.js";

/**
 * Adds new item to project. Loads project fields and caches them unless already loaded.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {Record<string, string>} fields
 * @returns {Promise<import("..").GitHubProjectItem>}
 */
export async function addItem(project, state, fields) {
  const stateWithFields = await getStateWithProjectFields(project, state);

  const {
    addProjectNextItem: { projectNextItem },
  } = await project.octokit.graphql(addIssueToProjectMutation, {
    projectId: stateWithFields.id,
  });

  const newItem = projectItemNodeToGitHubProjectItem(
    stateWithFields,
    projectNextItem
  );

  // add newly created item to cache
  if (state.didLoadItems) {
    state.items.push(newItem);
  }

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

  const query = getFieldsUpdateQuery(stateWithFields, existingFields);

  await project.octokit.graphql(query, {
    projectId: stateWithFields.id,
    itemId: newItem.id,
  });

  return {
    ...newItem,
    fields: {
      ...newItem.fields,
      ...removeUndefinedValues(fields),
    },
  };
}
