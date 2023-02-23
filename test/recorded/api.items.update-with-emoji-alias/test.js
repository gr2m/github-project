// @ts-check

import GitHubProject from "../../../index.js";

/**
 * @param {import("../../../").default} defaultTestingProject
 * @param {string} [itemId]
 */
export function test(defaultTestingProject, itemId = "PVTI_1") {
  const project = new GitHubProject({
    owner: defaultTestingProject.owner,
    number: defaultTestingProject.number,
    octokit: defaultTestingProject.octokit,
    fields: {
      "🎯text": "Text",
    },
  });
  
  return project.items.update(itemId, { "🎯text": "new text" });
}
