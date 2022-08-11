// @ts-check

import { itemFieldsNodesToFieldsMap } from "./item-fields-nodes-to-fields-map.js";

/**
 * Takes a GraphQL `ProjectNextItem` node and returns a `ProjectItem` object
 * in the format we return it from the GitHubProject API.
 *
 * @param {import("../..").GitHubProjectStateWithFields | import("../..").GitHubProjectStateWithItems} state
 * @param {any} itemNode
 * @returns {import("../..").GitHubProjectItem}
 */
export function projectItemNodeToGitHubProjectItem(state, itemNode) {
  const fields = itemFieldsNodesToFieldsMap(state, itemNode.fieldValues.nodes);

  // item is draft or redacted
  // TODO: implement adding draft item and add tests
  /* c8 ignore next 7 */
  if (!itemNode.content || itemNode.type === "DRAFT_ISSUE") {
    return {
      id: itemNode.id,
      type: itemNode.type,
      fields,
    };
  }

  // item is issue or pull request
  const common = {
    id: itemNode.content.id,
    number: itemNode.content.number,
    createdAt: itemNode.content.createdAt,
    closed: itemNode.content.closed,
    closedAt: itemNode.content.closedAt,
    assignees: itemNode.content.assignees.nodes.map((node) => node.login),
    labels: itemNode.content.labels.nodes.map((node) => node.name),
    repository: itemNode.content.repository.name,
    milestone: itemNode.content.milestone,
    title: itemNode.content.title,
    url: itemNode.content.url,
    databaseId: itemNode.content.databaseId,
  };
  const content =
    itemNode.type === "ISSUE"
      ? {
          isIssue: true,
          isPullRequest: false,
          ...common,
        }
      : {
          isIssue: false,
          isPullRequest: true,
          ...common,
          merged: itemNode.content.merged,
        };

  return {
    id: itemNode.id,
    type: itemNode.type,
    fields,
    // @ts-expect-error - complains about `.merged` property
    content,
  };
}
