// @ts-check

/**
 * @param {import("../../..").default} project
 */
export function test(project) {
  return project.items.removeByContentRepositoryAndNumber(
    "unknown-repository",
    -1
  );
}
