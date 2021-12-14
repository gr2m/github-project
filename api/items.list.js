// @ts-check

import { getProjectWithItemsQuery } from "./lib/queries.js";
import { projectFieldsNodesToFieldsMap } from "./lib/project-fields-nodes-to-fields-map.js";
import { itemFieldsNodesToFieldsMap } from "./lib/item-fields-nodes-to-fields-map.js";

/**
 * @param {import("../").default} project
 * @returns {Promise<import("..").GitHubProjectItem[]>}
 */
export default async function listItems(project) {
  const {
    organization: { projectNext },
  } = await project.octokit.graphql(getProjectWithItemsQuery, {
    org: project.org,
    number: project.number,
  });

  const projectFields = projectFieldsNodesToFieldsMap(
    project,
    projectNext.fields.nodes
  );

  return projectNext.items.nodes.reduce((acc, item) => {
    const fields = itemFieldsNodesToFieldsMap(
      projectFields,
      item.fieldValues.nodes
    );

    // item is draft
    if (!item.content) {
      return acc.concat({
        id: item.id,
        fields,
        isDraft: true,
      });
    }

    // item is issue or pull request
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

    return acc.concat({
      id: item.id,
      fields,
      isDraft: false,
      issueOrPullRequest,
    });
  }, []);
}
