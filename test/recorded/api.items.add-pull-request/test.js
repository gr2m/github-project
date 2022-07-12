// @ts-check

/**
 * @param {import("../../../").default} project
 * @param {string} itemId
 */
export function test(project, itemId = "PR_1") {
  return project.items.add(itemId);
}
