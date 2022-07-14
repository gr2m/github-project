// @ts-check

/**
 * @param {import("../../..").default} project
 * @param {string} [contentId]
 */
export function test(project, contentId = "I_1") {
  // I_1 is the normalized Issue Node ID in `./fixtures.json`
  return project.items.get(contentId);
}
