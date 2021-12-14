// @ts-check

import { addIssueToProjectMutation } from "./lib/queries.js";
import { projectItemNodeToGitHubProjectItem } from "./lib/project-item-node-to-github-project-item.js";
import { getStateWithProjectFields } from "./lib/get-state-with-project-fields.js";

/**
 * Adds new item to project. Loads project fields and caches them unless already loaded.
 *
 * @param {import("../").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} contentNodeId
 * @returns {Promise<import("..").GitHubProjectItem>}
 */
export default async function addItem(project, state, contentNodeId) {
  const stateWithFields = await getStateWithProjectFields(project, state);

  const {
    addProjectNextItem: { projectNextItem },
  } = await project.octokit.graphql(addIssueToProjectMutation, {
    projectId: stateWithFields.id,
    contentId: contentNodeId,
  });

  return projectItemNodeToGitHubProjectItem(stateWithFields, projectNextItem);
}
