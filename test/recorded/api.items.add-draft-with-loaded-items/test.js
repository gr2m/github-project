// @ts-check

/**
 * @param {import("../../..").default} project
 */
export async function test(project) {
  await project.items.list();

  return project.items.addDraft({ title: "Draft Title" });
}
