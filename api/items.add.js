import {
  getProjectCoreDataQuery,
  addIssueToProjectMutation,
} from "./lib/queries.js";
import { projectFieldsNodesToFieldsMap } from "./lib/project-fields-nodes-to-fields-map.js";
import { itemFieldsNodesToFieldsMap } from "./lib/item-fields-nodes-to-fields-map.js";

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

  const {
    addProjectNextItem: { projectNextItem: item },
  } = await project.octokit.graphql(addIssueToProjectMutation, {
    projectId: projectNext.id,
    contentId: contentNodeId,
  });

  const projectFields = projectFieldsNodesToFieldsMap(
    project,
    projectNext.fields.nodes
  );
  const fields = itemFieldsNodesToFieldsMap(
    projectFields,
    item.fieldValues.nodes
  );

  const common = {
    id: item.content.id,
    number: item.content.number,
    createdAt: item.content.createdAt,
    closed: item.content.closed,
    closedAt: item.content.closedAt,
    assignees: item.content.assignees.nodes.map((node) => node.login),
    labels: item.content.labels.nodes.map((node) => node.name),
    repository: item.content.repository.nameWithOwner,
    milestone: item.content.milestone,
  };
  const issueOrPullRequest =
    item.content.__typename === "Issue"
      ? {
          isIssue: true,
          isPullRequest: false,
          ...common,
        }
      : {
          isIssue: false,
          isPullRequest: true,
          ...common,
          merged: item.content.merged,
        };

  return {
    id: item.id,
    fields,
    isDraft: false,
    issueOrPullRequest,
  };
}
