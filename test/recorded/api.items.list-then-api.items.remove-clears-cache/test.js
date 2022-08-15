// @ts-check

/**
 * `project.items.list()` creates an internal cache of all items in the project.
 * This tests makes sure that `project.items.remove(id)` correctly updates that cache,
 * so that `project.items.get(id)` does not return a non-existing item.
 *
 * @param {import("../../../").default} project
 * @param {string} itemId
 */
export async function test(project, itemId = "PVTI_1") {
  await project.items.list();
  await project.items.remove(itemId);
  return project.items.get(itemId);
}
