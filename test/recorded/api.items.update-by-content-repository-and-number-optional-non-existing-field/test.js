// @ts-check

import GitHubProject from "../../../index.js";

/**
 * @param {import("../../../").default} testProject
 * @param {string} [repositoryName]
 * @param {number} [issueNumber]
 */
export function test(
  testProject,
  repositoryName = "test-repository",
  issueNumber = 1
) {
  const project = new GitHubProject({
    org: testProject.org,
    number: testProject.number,
    octokit: testProject.octokit,
    fields: {
      unknown: { name: "Unknown", optional: true },
    },
  });

  return project.items.updateByContentRepositoryAndNumber(
    repositoryName,
    issueNumber,
    { unknown: "nope" }
  );
}
