// @ts-check

import { getStateWithProjectItems } from "./lib/get-state-with-project-items.js";
import { getFieldsUpdateQuery } from "./lib/get-fields-update-query.js";

/**
 * Updates item fields if the item can be found.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} nodeId - `ProjectNextItem.id` or `ProjectNextItem.content.id`
 * @param {Record<string, string>} fields
 * @returns {Promise<import("..").GitHubProjectItem | undefined>}
 */
export default async function updateItem(project, state, nodeId, fields) {
  const stateWithItems = await getStateWithProjectItems(project, state);

  const item = stateWithItems.items.find(
    // @ts-expect-error - does not handle the conditional chaining operator
    (item) => item.id === nodeId || item.issueOrPullRequest?.id === nodeId
  );

  if (!item) return;

  const query = getFieldsUpdateQuery(stateWithItems, fields);
  await project.octokit.graphql(query, {
    projectId: stateWithItems.id,
    itemId: item.id,
  });

  // mutate item in cache
  item.fields = {
    ...item.fields,
    ...fields,
  };

  return item;
}
