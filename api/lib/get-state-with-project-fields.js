// @ts-check

import { getProjectCoreDataQuery } from "./queries.js";
import { projectFieldsNodesToFieldsMap } from "./project-fields-nodes-to-fields-map.js";

/**
 * This method assures that the project fields are loaded. It returns the new
 * state for simpler TypeScript IntelliSense, but also mutates the state directly
 *
 * @param {import("../..").default} project
 * @param {import("../..").GitHubProjectState} state
 * @returns {Promise<import("../..").GitHubProjectStateWithFields | import("../..").GitHubProjectStateWithItems>}
 */
export async function getStateWithProjectFields(project, state) {
  if (state.didLoadFields) {
    return state;
  }

  const {
    organization: { projectNext },
  } = await project.octokit.graphql(getProjectCoreDataQuery, {
    org: project.org,
    number: project.number,
  });

  const fields = projectFieldsNodesToFieldsMap(
    state,
    project,
    projectNext.fields.nodes
  );

  const { id, title, description, url } = projectNext;

  // mutate current state and return it
  // @ts-expect-error - TS can't handle Object.assign
  return Object.assign(state, {
    didLoadFields: true,
    id,
    title,
    description,
    url,
    fields,
  });
}
