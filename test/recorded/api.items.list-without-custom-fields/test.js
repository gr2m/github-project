// @ts-check

import GitHubProject from "../../../index.js";

/**
 * @param {import("../../../").default} defaultTestProject
 */
export function test(defaultTestProject) {
  const project = new GitHubProject({
    owner: defaultTestProject.owner,
    number: defaultTestProject.number,
    octokit: defaultTestProject.octokit,
    fields: {},
  });

  return project.items.list();
}
