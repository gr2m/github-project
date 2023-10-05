// @ts-check

import { addDraftIssueToProjectMutation } from "./lib/queries.js";
import { projectItemNodeToGitHubProjectItem } from "./lib/project-item-node-to-github-project-item.js";
import { getStateWithProjectFields } from "./lib/get-state-with-project-fields.js";
import { removeObjectKeys } from "./lib/remove-object-keys.js";
import { updateItemFields } from "./lib/update-project-item-fields.js";

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

  const fieldsAfterUpdate = await updateItemFields(
    project,
    state,
    draftItem.id,
    fields
  );

  if (!fieldsAfterUpdate) {
    return {
      ...draftItem,
      // @ts-expect-error - complaints that built-in fields `title` and `status` might not exist, but we are good here
      fields: removeObjectKeys(draftItem.fields, nonExistingProjectFields),
    };
  }

  return {
    ...draftItem,
    fields: fieldsAfterUpdate,
  };
}
