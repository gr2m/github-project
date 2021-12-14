// @ts-check

import {
  getProjectCoreDataQuery,
  addIssueToProjectMutation,
} from "./lib/queries.js";
import { projectFieldsNodesToFieldsMap } from "./lib/project-fields-nodes-to-fields-map.js";
import { projectItemNodeToGitHubProjectItem } from "./lib/project-item-node-to-github-project-item.js";

/**
 * @param {import("../").default} project
 * @returns {Promise<import("..").GitHubProjectItem>}
 */
export default async function addItem(project, contentNodeId) {
  // TODO: refactor `items.list.js` to load data into an internal state
  //       that can be used across the different APIs. We need the project ID
  //       here, while we only have the project number.
  //       If we loaded the data before, then there is no need to load it again

  const {
    organization: { projectNext },
  } = await project.octokit.graphql(getProjectCoreDataQuery, {
    org: project.org,
    number: project.number,
  });

  const projectFields = projectFieldsNodesToFieldsMap(
    project,
    projectNext.fields.nodes
  );

  const {
    addProjectNextItem: { projectNextItem },
  } = await project.octokit.graphql(addIssueToProjectMutation, {
    projectId: projectNext.id,
    contentId: contentNodeId,
  });

  return projectItemNodeToGitHubProjectItem(projectFields, projectNextItem);
}
