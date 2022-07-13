// @ts-check

/**
 * @param {import("../../../").default} project
 */
export function test(project) {
  return project.items.update("<unknown id>", { text: "new text" });
}
