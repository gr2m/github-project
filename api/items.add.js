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
  let newOrExistingItem;
  if (state.didLoadItems) {
    const existingItem = state.items.find(
      // @ts-expect-error - does not handle the conditional chaining operator
      (item) => item.issueOrPullRequest?.id === contentNodeId
    );

    if (existingItem && !fields) existingItem;
    newOrExistingItem = existingItem;
  }

  const stateWithFields = await getStateWithProjectFields(project, state);

  if (!newOrExistingItem) {
    const {
      addProjectNextItem: { projectNextItem },
    } = await project.octokit.graphql(addIssueToProjectMutation, {
      projectId: stateWithFields.id,
      contentId: contentNodeId,
    });

    newOrExistingItem = projectItemNodeToGitHubProjectItem(
      stateWithFields,
      projectNextItem
    );

    // add newly created item to cache
    if (state.didLoadItems) {
      state.items.push(newOrExistingItem);
    }
  }

  if (!fields) return newOrExistingItem;

  const query = getFieldsUpdateQuery(stateWithFields, fields);
  await project.octokit.graphql(query, {
    projectId: stateWithFields.id,
    itemId: newOrExistingItem.id,
  });

  return {
    ...newOrExistingItem,
    fields: {
      ...newOrExistingItem.fields,
      ...fields,
    },
  };
}
