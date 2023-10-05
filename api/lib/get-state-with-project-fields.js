// @ts-check

import { getProjectCoreDataQuery } from "./queries.js";
import { projectFieldsNodesToFieldsMap } from "./project-fields-nodes-to-fields-map.js";
import { GitHubProjectNotFoundError } from "../../index.js";

/**
 * This method assures that the project fields are loaded. It returns the new
 * state for simpler TypeScript IntelliSense, but also mutates the state directly
 *
 * @param {import("../..").default} project
 * @param {import("../..").GitHubProjectState} state
 *
 * @returns {Promise<import("../..").GitHubProjectStateWithFields>}
 */
export async function getStateWithProjectFields(project, state) {
  if (state.didLoadFields) {
    return state;
  }

  const response = await getProjectCoreData(project);

  const {
    userOrOrganization: { projectV2 },
  } = response;

  const fields = projectFieldsNodesToFieldsMap(
    state,
    project,
    projectV2.fields.nodes
  );

  const { id, title, url, databaseId } = projectV2;

  // mutate current state and return it
  // @ts-expect-error - TS can't handle Object.assign
  return Object.assign(state, {
    didLoadFields: true,
    id,
    title,
    url,
    databaseId,
    fields,
  });
}

/**
 *
 * @param {import("../..").default} project
 * @returns {Promise<any>}
 */
async function getProjectCoreData(project) {
  try {
    return await project.octokit.graphql(getProjectCoreDataQuery, {
      owner: project.owner,
      number: project.number,
    });
  } catch (error) {
    /* c8 ignore next */
    if (error?.response?.errors[0]?.type !== "NOT_FOUND") throw error;

    throw new GitHubProjectNotFoundError({
      owner: project.owner,
      number: project.number,
    });
  }
}
