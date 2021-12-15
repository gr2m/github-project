// @ts-check

import { getStateWithProjectItems } from "./lib/get-state-with-project-items.js";
import { getFieldsUpdateQuery } from "./lib/get-fields-update-query.js";
import { removeUndefinedValues } from "./lib/remove-undefined-values.js";

/**
 * Updates item fields if the item can be found.
 * In order to find an item by content ID, all items need to be loaded first.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} contentNodeId
 * @param {Record<string, string>} fields
 * @returns {Promise<import("..").GitHubProjectItem | undefined>}
 */
export async function updateItemByContentId(
  project,
  state,
  contentNodeId,
  fields
) {
  const stateWithItems = await getStateWithProjectItems(project, state);

  const item = stateWithItems.items.find(
    // @ts-expect-error - does not handle the conditional chaining operator
    (item) => item.content?.id === contentNodeId
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
    ...removeUndefinedValues(fields),
  };

  return item;
}
