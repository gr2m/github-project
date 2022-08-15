// @ts-check

/**
 * @param {import("../../..").default} project
 */
export function test(project) {
  return project.items.addDraft(
    {
      title: "Draft Title",
    },
    {}
  );
}
