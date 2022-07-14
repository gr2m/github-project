// @ts-check

/**
 * @param {import("../../../").default} project
 * @param {string} [itemId]
 */
export function test(project, itemId = "PNI_1") {
  return project.items.get(itemId);
}
