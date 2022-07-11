// @ts-check

import GitHubProject from "../../../index.js";

/**
 * @param {import("../../..").default} defaultTestProject
 */
export function test(defaultTestProject) {
  const project = new GitHubProject({
    org: defaultTestProject.org,
    number: defaultTestProject.number,
    octokit: defaultTestProject.octokit,
    fields: {
      ...defaultTestProject.fields,
      nonExistingField: { name: "Nope", optional: true },
    },
  });

  return project.items.getByContentId("I_1");
}
