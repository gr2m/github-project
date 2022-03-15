// @ts-check

import { getProjectWithItemsQuery } from "./queries.js";
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
  });

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
