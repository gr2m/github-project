// @ts-check

/**
 * @param {import("../../../").default} project
 * @param {string} [contentId]
 */
export function test(project, contentId = "I_1") {
  return project.items.removeByContentId(contentId);
}
