// @ts-check

import {
  getProjectWithItemsQuery,
  getProjectItemsPaginatedQuery,
} from "./lib/queries.js";
import { projectFieldsNodesToFieldsMap } from "./lib/project-fields-nodes-to-fields-map.js";
import { projectItemNodeToGitHubProjectItem } from "./lib/project-item-node-to-github-project-item.js";

/**
 * Load all project items
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @returns {Promise<import("..").GitHubProjectItem[]>}
 */
export async function listItems(project, state) {
  const {
    userOrOrganization: { projectV2 },
  } = await project.octokit.graphql(getProjectWithItemsQuery, {
    owner: project.owner,
    number: project.number,
  });

  const fields = projectFieldsNodesToFieldsMap(
    state,
    project,
    projectV2.fields.nodes
  );

  const items = projectV2.items.nodes.map((node) => {
    // @ts-expect-error - for simplicity only pass fields instead of a full state
    return projectItemNodeToGitHubProjectItem({ fields }, node);
  });

  // Recursively fetch all additional items for this project
  if (projectV2.items.pageInfo.hasNextPage) {
    await fetchProjectItems(project, fields, {
      cursor: projectV2.items.pageInfo.endCursor,
      results: items,
    });
  }

  const { id, title, url } = projectV2;

  // mutate current state
  Object.assign(state, {
    didLoadFields: true,
    id,
    title,
    url,
    fields,
  });

  return items;
}

/**
 * This method recursively executes a paginated query to gather all project items for a project
 * It collects the items into options.results, and can start from an arbitrary GraphQL cursor
 *
 * @param {import("..").default} project
 * @param {import("..").ProjectFieldMap} fields
 * @param {{ cursor?: string | undefined, results?: Array<import("..").GitHubProjectItem> }} options
 *
 * @returns {Promise<import("..").GitHubProjectItem[]>}
 */
async function fetchProjectItems(
  project,
  fields,
  { cursor = undefined, results = [] } = {}
) {
  const {
    userOrOrganization: {
      projectV2: { items },
    },
  } = await project.octokit.graphql(getProjectItemsPaginatedQuery, {
    owner: project.owner,
    number: project.number,
    first: 100,
    after: cursor,
  });

  results.push(
    ...items.nodes.map((node) => {
      // @ts-expect-error - for simplicity only pass fields instead of a full state
      return projectItemNodeToGitHubProjectItem({ fields }, node);
    })
  );

  if (items.pageInfo.hasNextPage) {
    await fetchProjectItems(project, fields, {
      results,
      cursor: items.pageInfo.endCursor,
    });
  }

  return results;
}
