// @ts-check
import GitHubProject from "../../../index.js";

/**
 * @param {import("../../..").default} defaultTestProject
 */
export function test(defaultTestProject) {
  return GitHubProject.getInstance({
    owner: defaultTestProject.owner,
    number: defaultTestProject.number,
    octokit: defaultTestProject.octokit,
    fields: {
      nope: "NOPE",
    },
  }).then(
    () => {
      throw new Error("Should not resolve");
    },
    (error) => error
  );
}
