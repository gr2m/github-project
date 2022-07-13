// @ts-check

import GitHubProject from "../../../index.js";

/**
 * @param {import("../../../").default} testProject
 */
export function test(testProject) {
  const project = new GitHubProject({
    org: testProject.org,
    number: testProject.number,
    octokit: testProject.octokit,
    fields: {
      text: "tExT",
      number: "nUMbEr",
    },
  });

  return project.items.list();
}
