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
      assignees: "Assignees",
    },
  });

  return project.items.update(itemId, { assignees: "something" }).then(
    () => {
      throw new Error("Should not resolve");
    },
    (error) => ({
      error,
      humanMessage: error.toHumanError(),
    })
  );
}
