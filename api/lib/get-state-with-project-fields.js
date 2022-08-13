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
    userOrOrganization: { projectV2 },
  } = await project.octokit.graphql(getProjectCoreDataQuery, {
    owner: project.owner,
    number: project.number,
  });

  const fields = projectFieldsNodesToFieldsMap(
    state,
    project,
    projectV2.fields.nodes
  );

  const { id, title, url } = projectV2;

  // mutate current state and return it
  // @ts-expect-error - TS can't handle Object.assign
  return Object.assign(state, {
    didLoadFields: true,
    id,
    title,
    url,
    fields,
  });
}
