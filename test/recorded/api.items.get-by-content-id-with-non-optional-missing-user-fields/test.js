// @ts-check

import GitHubProject from "../../../index.js";

/**
 * @param {import("../../..").default} defaultTestProject
 * @param {string} [contentId]
 */
export async function test(defaultTestProject, contentId = "I_1") {
  const project = new GitHubProject({
    owner: defaultTestProject.owner,
    number: defaultTestProject.number,
    octokit: defaultTestProject.octokit,
    fields: {
      ...defaultTestProject.fields,
      nonExistingField: { name: "Nope", optional: false },
    },
  });

  return project.items.getByContentId(contentId).then(
    () => new Error("should have thrown"),
    (error) => error
  );
}
