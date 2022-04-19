// @ts-check

import {
  getProjectWithItemsQuery,
  getProjectItemsPaginatedQuery,
} from "./queries.js";
import { projectFieldsNodesToFieldsMap } from "./project-fields-nodes-to-fields-map.js";
import { projectItemNodeToGitHubProjectItem } from "./project-item-node-to-github-project-item.js";

/**
 * This method assures that the project fields and items are loaded. It returns the new
 * state for simpler TypeScript IntelliSense, but also mutates the state directly
 *
 * @param {import("../..").default} project
 * @param {import("../..").GitHubProjectState} state
 * @returns {Promise<import("../..").GitHubProjectStateWithItems>}
 */
export async function getStateWithProjectItems(project, state) {
  if (state.didLoadItems) {
    return state;
  }

  const {
    organization: { projectNext },
  } = await project.octokit.graphql(getProjectWithItemsQuery, {
    org: project.org,
    number: project.number,
  });

  const fields = projectFieldsNodesToFieldsMap(
    state,
    project,
    projectNext.fields.nodes
  );

  const items = projectNext.items.nodes.map((node) => {
    // @ts-expect-error - for simplicity only pass fields instead of a full state
    return projectItemNodeToGitHubProjectItem({ fields }, node);
  })

  // Recursively fetch all additional items for this project
  if (projectNext.items.pageInfo.hasNextPage) {
    await fetchProjectItems(project, fields, { cursor: projectNext.items.pageInfo.endCursor, results: items });
  }

  const { id, title, description, url } = projectNext;

  // mutate current state and return it
  // @ts-expect-error - TS can't handle Object.assign
  return Object.assign(state, {
    didLoadFields: true,
    didLoadItems: true,
    id,
    title,
    description,
    url,
    fields,
    items,
  });
}

/**
 * This method recursively executes a paginated query to gather all project items for a project
 * It collects the items into options.results, and can start from an arbitrary GraphQL cursor
 *
 * @param {import("../..").default} project
 * @param {import("../..").ProjectFieldMap} fields
 * @param {{ cursor?: string | undefined, results?: Array<import("../..").GitHubProjectItem> }} options
 * @returns {Promise<import("../..").GitHubProjectItem[]>}
 */
async function fetchProjectItems(
  project,
  fields,
  { cursor = undefined, results = [] } = {}
) {
  const {
    organization: {
      projectNext: { items },
    },
  } = await project.octokit.graphql(getProjectItemsPaginatedQuery, {
    org: project.org,
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
