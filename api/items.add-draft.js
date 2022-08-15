// @ts-check

import { addDraftIssueToProjectMutation } from "./lib/queries.js";
import { projectItemNodeToGitHubProjectItem } from "./lib/project-item-node-to-github-project-item.js";
import { getStateWithProjectFields } from "./lib/get-state-with-project-fields.js";
import { getFieldsUpdateQueryAndFields } from "./lib/get-fields-update-query-and-fields.js";
import { removeObjectKeys } from "./lib/remove-object-keys.js";

/**
 * Creates draft item in project.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {import("..").DraftItemContent} content
 * @param {Record<string, string>} [fields]
 *
 * @returns {Promise<import("..").GitHubProjectItem>}
 */
export async function addDraftItem(project, state, content, fields) {
  const stateWithFields = await getStateWithProjectFields(project, state);

  const {
    addProjectV2DraftIssue: { projectItem: itemNode },
  } = await project.octokit.graphql(addDraftIssueToProjectMutation, {
    projectId: stateWithFields.id,
    title: content.title,
    body: content.body,
    assigneeIds: content.assigneeIds,
  });

  const draftItem = projectItemNodeToGitHubProjectItem(
    stateWithFields,
    itemNode
  );

  if (!fields) return draftItem;

  const nonExistingProjectFields = Object.entries(stateWithFields.fields)
    .filter(([, field]) => field.existsInProject === false)
    .map(([key]) => key);
  const existingProjectFieldKeys = Object.keys(fields).filter(
    (key) => !nonExistingProjectFields.includes(key)
  );

  if (existingProjectFieldKeys.length === 0)
    return {
      ...draftItem,
      // @ts-expect-error - complaints that built-in fields `title` and `status` might not exist, but we are good here
      fields: removeObjectKeys(draftItem.fields, nonExistingProjectFields),
    };

  const existingFields = Object.fromEntries(
    existingProjectFieldKeys.map((key) => [key, fields[key]])
  );

  const result = getFieldsUpdateQueryAndFields(stateWithFields, existingFields);

  await project.octokit.graphql(result.query, {
    projectId: stateWithFields.id,
    itemId: draftItem.id,
  });

  return {
    ...draftItem,
    fields: result.fields,
  };
}
