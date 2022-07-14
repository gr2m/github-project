// @ts-check

/**
 * @param {import("../../../").default} project
 * @param {string} [repositoryName]
 * @param {number} [issueNumber]
 */
export function test(
  project,
  repositoryName = "test-repository",
  issueNumber = 1
) {
  return project.items.updateByContentRepositoryAndNumber(
    repositoryName,
    issueNumber,
    { text: "new text" }
  );
}
