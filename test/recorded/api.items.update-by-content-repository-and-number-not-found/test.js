// @ts-check

/**
 * @param {import("../../../").default} project
 */
export function test(project) {
  return project.items.updateByContentRepositoryAndNumber(
    "unknown-repository",
    -1,
    { text: "new text" }
  );
}
