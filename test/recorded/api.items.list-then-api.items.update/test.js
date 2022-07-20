// @ts-check

/**
 * @param {import("../../../").default} project
 * @param {string} [itemId]
 */
export async function test(project, itemId = "PVTI_1") {
  await project.items.list();

  return project.items.update(itemId, { text: "new text" });
}
