// @ts-check

import { getStateWithProjectFields } from "./lib/get-state-with-project-fields.js";
import { getFieldsUpdateQuery } from "./lib/get-fields-update-query.js";
import { removeUndefinedValues } from "./lib/remove-undefined-values.js";
import { projectItemNodeToGitHubProjectItem } from "./lib/project-item-node-to-github-project-item.js";

/**
 * Updates item fields if the item can be found and returns the full item
 * with all fields and content properties.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} itemNodeId
 * @param {Record<string, string>} fields
 * @returns {Promise<import("..").GitHubProjectItem | undefined>}
 */
export async function updateItem(project, state, itemNodeId, fields) {
  const stateWithFields = await getStateWithProjectFields(project, state);

  const query = getFieldsUpdateQuery(stateWithFields, fields);

  try {
    const result = await project.octokit.graphql(query, {
      projectId: stateWithFields.id,
      itemId: itemNodeId,
    });

    // if cache is loaded, get item form cache and update it
    if (state.didLoadItems) {
      const item = state.items.find((item) => item.id === itemNodeId);
      if (item) {
        item.fields = {
          ...item.fields,
          ...removeUndefinedValues(fields),
        };
      }
      return item;
    }

    // otherwise read all information from the first query response key
    const { projectNextItem } = result[Object.keys(result)[0]];
    return projectItemNodeToGitHubProjectItem(stateWithFields, projectNextItem);
  } catch (error) {
    if (!error.errors) throw error;

    if (error.errors[0].type === "NOT_FOUND") return;

    throw error;
  }
}
