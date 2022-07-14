// @ts-check

/**
 * `project.items.list()` creates a cache. We want to test that this case is updated
 * when adding a new item
 *
 * In thist test, we have a repository with two issues, but only the first issue has
 * been added to the project. The 2nd issue (id: I_2) is not in the project yet.
 *
 * @param {import("../../..").default} project
 * @param {string} [contentId]
 */
export async function test(project, contentId = "I_2") {
  await project.items.list();
  await project.items.add(contentId);
  return project.items.get(contentId);
}
