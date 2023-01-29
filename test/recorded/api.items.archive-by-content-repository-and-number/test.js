// @ts-check

/**
 * @param {import("../../../").default} project
 * @param {string} [repositoryName]
 * @param {number} [issueNumber]
 */
export async function test(
  project,
  repositoryName = "test-repository",
  issueNumber = 1
) {
  const first = await project.items.archiveByContentRepositoryAndNumber(
    repositoryName,
    issueNumber
  );
  // 2nd time it won't send a mutation
  const second = await project.items.archiveByContentRepositoryAndNumber(
    repositoryName,
    issueNumber
  );
  // resolves with undefined if not found
  const third = await project.items.archiveByContentRepositoryAndNumber(
    "<unknown repository name>",
    1
  );

  return [first, second, third];
}
