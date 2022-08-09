// @ts-check

import GitHubProject from "../../../index.js";

/**
 * @param {import("../../..").default} defaultTestProject
 * @param {string} [itemId]
 */
export async function test(defaultTestProject, itemId = "PVTI_1") {
  const matchFieldOptionValueArguments = [];

  const project = new GitHubProject({
    org: defaultTestProject.org,
    number: defaultTestProject.number,
    octokit: defaultTestProject.octokit,
    fields: defaultTestProject.fields,
    matchFieldOptionValue(fieldOptionValue, userValue) {
      matchFieldOptionValueArguments.push({ fieldOptionValue, userValue });

      return fieldOptionValue === "One" && userValue === "1";
    },
  });

  const result = await project.items.update(itemId, { singleSelect: "1" });

  return { result, matchFieldOptionValueArguments };
}
