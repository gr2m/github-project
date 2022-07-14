// @ts-check

import GitHubProject from "../../../index.js";

/**
 * @param {import("../../../").default} testProject
 * @param {string} [itemId]
 */
export function test(testProject, itemId = "PNI_1") {
  const project = new GitHubProject({
    org: testProject.org,
    number: testProject.number,
    octokit: testProject.octokit,
    fields: {
      status: "Text",
    },
  });

  return project.items.update(itemId, { status: "new text" });
}
