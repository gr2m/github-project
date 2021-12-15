// @ts-check

import { getStateWithProjectItems } from "./lib/get-state-with-project-items.js";

/**
 * Load all project fields and items and cache them
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @returns {Promise<import("..").GitHubProjectItem[]>}
 */
export async function listItems(project, state) {
  const stateWithItems = await getStateWithProjectItems(project, state);
  return stateWithItems.items;
}
