// @ts-check

import GitHubProject from "../../../index.js";

/**
 * @param {import("../../../").default} defaultTestProject
 * @param {string} [itemId]
 */
export function test(defaultTestProject, itemId = "PVTI_1") {
  const project = new GitHubProject({
    owner: defaultTestProject.owner,
    number: defaultTestProject.number,
    octokit: defaultTestProject.octokit,
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
