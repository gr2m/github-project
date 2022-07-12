// @ts-check

/**
 * @param {import("../../../").default} project
 * @param {string} itemId
 */
export function test(project, itemId = "I_1") {
  project.items.add(itemId);
  return project.items.add(itemId);
}
