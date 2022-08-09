// @ts-check

import GitHubProject from "../../../index.js";

/**
 * @param {import("../../..").default} defaultTestProject
 */
export async function test(defaultTestProject) {
  const matchFieldNameArguments = [];

  const project = new GitHubProject({
    org: defaultTestProject.org,
    number: defaultTestProject.number,
    octokit: defaultTestProject.octokit,
    fields: {
      text: "Not Text",
    },
    matchFieldName(projectFieldName, userFieldName) {
      if (userFieldName === "not text" && projectFieldName === "text") {
        return true;
      }

      return projectFieldName === userFieldName;
    },
  });

  const result = await project.items.list();
  return { result, matchFieldNameArguments };
}
