// @ts-check

/**
 * @param {import("../../../").default} project
 */
export async function clearTestProject(project) {
  const items = await project.items.list();
  for (const item of items) {
    await project.items.remove(item.id);
  }
}
