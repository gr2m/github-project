// @ts-check

import GitHubProject from "../../../index.js";

/**
 * @param {import("../../../").default} defaultTestProject
 * @param {string} [repositoryName]
 * @param {number} [issueNumber]
 */
export function test(
  defaultTestProject,
  repositoryName = "test-repository",
  issueNumber = 1
) {
  const project = new GitHubProject({
    owner: defaultTestProject.owner,
    number: defaultTestProject.number,
    octokit: defaultTestProject.octokit,
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
