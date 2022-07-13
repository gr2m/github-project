// @ts-check

/**
 * `project.items.list()` creates an internal cache of all items in the project.
 * This tests makes sure that `project.items.remove(id)` correctly updates that cache,
 * so that `project.items.get(id)` does not return a non-existing item.
 *
 * @param {import("../../../").default} project
 */
export async function test(project) {
  await project.items.list();
  return project.items.remove("<unknown id>");
}
