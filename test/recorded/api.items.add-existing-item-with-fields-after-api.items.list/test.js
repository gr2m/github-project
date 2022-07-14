// @ts-check

/**
 * @param {import("../../..").default} project
 * @param {string} [contentId]
 */
export async function test(project, contentId = "I_1") {
  await project.items.list();
  return project.items.add(contentId, {
    status: "Done",
  });
}
