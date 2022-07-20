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
      assignees: "Assignees",
    },
  });

  return project.items.update(itemId, { assignees: "something" }).then(
    () => {
      throw new Error("Should not resolve");
    },
    (error) => error
  );
}
