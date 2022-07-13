// @ts-check

/**
 * @param {import("../../../").default} project
 */
export function test(project) {
  return project.items.updateByContentId("<unknown>", { text: "new text" });
}
