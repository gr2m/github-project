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
      iteration: "Iteration",
    },
  });

  return project.items.update(itemId, { iteration: "Iteration 2" });
}
