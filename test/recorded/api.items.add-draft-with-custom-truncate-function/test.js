// @ts-check

import GitHubProject from "../../../index.js";

/**
 * @param {import("../../..").default} defaultTestProject
 */
export async function test(defaultTestProject) {
  const project = new GitHubProject({
    owner: defaultTestProject.owner,
    number: defaultTestProject.number,
    octokit: defaultTestProject.octokit,
    fields: defaultTestProject.fields,
    truncate: (text) => `return of custom truncate of "${text}"`,
  });

  return project.items.addDraft(
    { title: "1024+ length test" },
    { text: "text" }
  );
}
