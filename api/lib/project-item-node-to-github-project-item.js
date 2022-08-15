// @ts-check

import { itemFieldsNodesToFieldsMap } from "./item-fields-nodes-to-fields-map.js";

/**
 * Takes a GraphQL `projectItem` node and returns a `ProjectItem` object
 * in the format we return it from the GitHubProject API.
 *
 * @param {import("../..").GitHubProjectStateWithFields} state
 * @param {any} itemNode
 *
 * @returns {import("../..").GitHubProjectItem}
 */
export function projectItemNodeToGitHubProjectItem(state, itemNode) {
  const fields = itemFieldsNodesToFieldsMap(state, itemNode.fieldValues.nodes);

  const common = {
    type: itemNode.type,
    id: itemNode.id,
    fields,
  };

  if (itemNode.type === "DRAFT_ISSUE") {
    return {
      ...common,
      content: {
        id: itemNode.content.id,
        title: itemNode.content.title,
        createdAt: itemNode.content.createdAt,
        assignees: itemNode.content.assignees.nodes.map((node) => node.login),
      },
    };
  }

  if (itemNode.type === "ISSUE" || itemNode.type === "PULL_REQUEST") {
    // item is issue or pull request
    const issue = {
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
        ? issue
        : { ...issue, merged: itemNode.content.merged };

    return {
      ...common,
      content,
    };
  }
  /* c8 ignore next 8 */

  // fallback: no content properties are set. Currently that's in case of "REDACTED"
  return {
    type: itemNode.type,
    id: itemNode.id,
    fields,
    content: {},
  };
}
