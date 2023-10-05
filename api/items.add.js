// @ts-check

import { addIssueToProjectMutation } from "./lib/queries.js";
import { projectItemNodeToGitHubProjectItem } from "./lib/project-item-node-to-github-project-item.js";
import { getStateWithProjectFields } from "./lib/get-state-with-project-fields.js";
import { removeObjectKeys } from "./lib/remove-object-keys.js";
import { updateItemFields } from "./lib/update-project-item-fields.js";

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

  const fieldsAfterUpdate = await updateItemFields(
    project,
    state,
    newItem.id,
    fields
  );

  if (!fieldsAfterUpdate) {
    return {
      ...newItem,
      // @ts-expect-error - complaints that built-in fields `title` and `status` might not exist, but we are good here
      fields: removeObjectKeys(newItem.fields, nonExistingProjectFields),
    };
  }

  return {
    ...newItem,
    fields: fieldsAfterUpdate,
  };
}
