// @ts-check

import GitHubProject from "../../../index.js";

/**
 * @param {import("../../../").default} testProject
 * @param {string} [contentId]
 */
export function test(testProject, contentId = "I_1") {
  const project = new GitHubProject({
    org: testProject.org,
    number: testProject.number,
    octokit: testProject.octokit,
    fields: {
      unknown: {
        name: "Unknown",
        optional: true,
      },
    },
  });
  return project.items.updateByContentId(contentId, { unknown: "Unknown" });
}
