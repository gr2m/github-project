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
 * @param {import("../").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} contentNodeId
 * @param {Record<string, string>} fields
 * @returns {Promise<import("..").GitHubProjectItem>}
 */
export async function addItem(project, state, contentNodeId, fields) {
  let newOrExistingItem;
  if (state.didLoadItems) {
    const existingItem = state.items.find(
      // @ts-expect-error - does not handle the conditional chaining operator
      (item) => item.content?.id === contentNodeId
    );

    if (existingItem && !fields) existingItem;
    newOrExistingItem = existingItem;
  }

  const stateWithFields = await getStateWithProjectFields(project, state);

  if (!newOrExistingItem) {
    const {
      addProjectV2ItemById: { item },
    } = await project.octokit.graphql(addIssueToProjectMutation, {
      projectId: stateWithFields.id,
      contentId: contentNodeId,
    });

    newOrExistingItem = projectItemNodeToGitHubProjectItem(
      stateWithFields,
      item
    );

    // add newly created item to cache
    if (state.didLoadItems) {
      state.items.push(newOrExistingItem);
    }
  }

  if (!fields) return newOrExistingItem;

  const nonExistingProjectFields = Object.entries(stateWithFields.fields)
    .filter(([, field]) => field.existsInProject === false)
    .map(([key]) => key);
  const existingProjectFieldKeys = Object.keys(fields).filter(
    (key) => !nonExistingProjectFields.includes(key)
  );

  if (existingProjectFieldKeys.length === 0)
    return {
      ...newOrExistingItem,
      // @ts-expect-error - complaints that built-in fields `title` and `status` might not exist, but we are good here
      fields: removeObjectKeys(
        newOrExistingItem.fields,
        nonExistingProjectFields
      ),
    };

  const existingFields = Object.fromEntries(
    existingProjectFieldKeys.map((key) => [key, fields[key]])
  );

  const query = getFieldsUpdateQuery(stateWithFields, existingFields);

  await project.octokit.graphql(query, {
    projectId: stateWithFields.id,
    itemId: newOrExistingItem.id,
  });

  return {
    ...newOrExistingItem,
    fields: {
      ...newOrExistingItem.fields,
      ...removeUndefinedValues(fields),
    },
  };
}
