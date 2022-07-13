// @ts-check

import GitHubProject from "../../../index.js";

/**
 * @param {import("../../../").default} testProject
 * @param {string} itemId
 */
export function test(testProject, itemId = "I_1") {
  const project = new GitHubProject({
    org: testProject.org,
    number: testProject.number,
    octokit: testProject.octokit,
    fields: {
      nonExistingField: { name: "Nope", optional: true },
    },
  });
  return project.items.add(itemId, {
    nonExistingField: "Nope?",
  });
}