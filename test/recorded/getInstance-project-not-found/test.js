// @ts-check
import GitHubProject from "../../../index.js";

/**
 * @param {import("../../..").default} defaultTestProject
 */
export function test(defaultTestProject) {
  return GitHubProject.getInstance({
    owner: defaultTestProject.owner,
    number: 99999,
    octokit: defaultTestProject.octokit,
  }).then(
    () => {
      throw new Error("Should not resolve");
    },
    (error) => ({
      error,
      humanMessage: error.toHumanMessage(),
    })
  );
}
