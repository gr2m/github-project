// @ts-check

import { getItem } from "./items.get.js";
import { updateItemFields } from "./lib/update-project-item-fields.js";

/**
 * Updates item fields if the item can be found and returns the full item
 * with all fields and content properties.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} itemNodeId
 * @param {Record<string, string>} fields
 *
 * @returns {Promise<import("..").GitHubProjectItem | undefined>}
 */
export async function updateItem(project, state, itemNodeId, fields) {
  const item = await getItem(project, state, itemNodeId);
  if (!item) return;

  const newFields = await updateItemFields(project, state, itemNodeId, fields);
  if (!newFields) return item;

  return {
    ...item,
    fields: newFields,
  };
}
