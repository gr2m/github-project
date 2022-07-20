// @ts-check

import GitHubProject from "../../../index.js";

/**
 * @param {import("../../../").default} testProject
 * @param {string} [itemId]
 */
export function test(testProject, itemId = "PVTI_1") {
  const project = new GitHubProject({
    org: testProject.org,
    number: testProject.number,
    octokit: testProject.octokit,
    fields: {
      text: "Text",
      unknown: "Unknown",
    },
  });

  return project.items
    .update(itemId, { text: "new text", unknown: "nope" })
    .then(
      () => {
        throw new Error("Should not resolve");
      },
      (error) => {
        return error;
      }
    );
}
