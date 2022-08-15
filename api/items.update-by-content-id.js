// @ts-check

import { getItemByContentId } from "./items.get-by-content-id.js";
import { updateItemFields } from "./lib/update-project-item-fields.js";

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
  const item = await getItemByContentId(project, state, contentNodeId);
  if (!item) return;

  const newFields = await updateItemFields(project, state, item.id, fields);
  if (!newFields) return item;

  return {
    ...item,
    fields: newFields,
  };
}
