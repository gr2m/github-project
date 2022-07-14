// @ts-check

/**
 * @param {import("../../../").default} project
 * @param {string} [contentId]
 */
export function test(project, contentId = "PR_1") {
  return project.items.add(contentId);
}
