// @ts-check

import GitHubProject from "../../../index.js";

/**
 * @param {import("../../../").default} defaultTestProject
 * @param {string} [contentId]
 */
export function test(defaultTestProject, contentId = "I_1") {
  const project = new GitHubProject({
    owner: defaultTestProject.owner,
    number: defaultTestProject.number,
    octokit: defaultTestProject.octokit,
    fields: {
      unknown: {
        name: "Unknown",
        optional: true,
      },
    },
  });
  return project.items.updateByContentId(contentId, { unknown: "Unknown" });
}
