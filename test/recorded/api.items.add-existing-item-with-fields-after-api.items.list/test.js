// @ts-check

/**
 * @param {import("../../..").default} project
 * @param {string} itemId
 */
export async function test(project, itemId = "I_1") {
  await project.items.list();
  return project.items.add(itemId, {
    status: "Done",
  });
}
