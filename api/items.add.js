// @ts-check

import { addIssueToProjectMutation } from "./lib/queries.js";
import { projectItemNodeToGitHubProjectItem } from "./lib/project-item-node-to-github-project-item.js";
import { getStateWithProjectFields } from "./lib/get-state-with-project-fields.js";
import { getFieldsUpdateQuery } from "./lib/get-fields-update-query.js";

/**
 * Adds new item to project. Loads project fields and caches them unless already loaded.
 *
 * @param {import("../").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} contentNodeId
 * @param {Record<string, string>} fields
 * @returns {Promise<import("..").GitHubProjectItem>}
 */
export default async function addItem(project, state, contentNodeId, fields) {
  const stateWithFields = await getStateWithProjectFields(project, state);

  const {
    addProjectNextItem: { projectNextItem },
  } = await project.octokit.graphql(addIssueToProjectMutation, {
    projectId: stateWithFields.id,
    contentId: contentNodeId,
  });

  const newItem = projectItemNodeToGitHubProjectItem(
    stateWithFields,
    projectNextItem
  );

  if (!fields) return newItem;

  const query = getFieldsUpdateQuery(stateWithFields, fields);
  await project.octokit.graphql(query, {
    projectId: stateWithFields.id,
    itemId: newItem.id,
  });

  return {
    ...newItem,
    fields: {
      ...newItem.fields,
      ...fields,
    },
  };
}
