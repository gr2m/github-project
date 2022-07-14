// @ts-check

/**
 * @param {import("../../../").default} project
 * @param {string} [contentId]
 */
export function test(project, contentId = "I_1") {
  project.items.add(contentId);
  return project.items.add(contentId);
}
