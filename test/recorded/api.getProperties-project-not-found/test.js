// @ts-check
import GitHubProject from "../../../index.js";

/**
 * @param {import("../../..").default} defaultTestProject
 */
export function test(defaultTestProject) {
  const project = new GitHubProject({
    owner: defaultTestProject.owner,
    number: 99999,
    octokit: defaultTestProject.octokit,
  });

  return project.getProperties().then(
    () => {
      throw new Error("Should not resolve");
    },
    (error) => ({
      error,
      humanMessage: error.toHumanMessage(),
    })
  );
}
