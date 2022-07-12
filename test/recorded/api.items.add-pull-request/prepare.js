import { composeCreatePullRequest } from "octokit-plugin-create-pull-request";

/**
 * Prepare state in order to record fixtures for test.js. Returns array of arguments that will be passed
 * passed as `test(project, ...arguments)`.
 *
 * @param {import("@octokit/openapi-types").components["schemas"]["repository"]} repository
 * @param {import("@octokit/core").Octokit} octokit
 * @param {import("../../..").default<{text: string, number: number, date: string, singleSelect: "One" | "Two" | "Three"}>} project
 * @returns {Promise<[string]>}
 */
export async function prepare(repository, octokit, project) {
  // create a test pull request
  const { data: pullRequest } = await composeCreatePullRequest(octokit, {
    owner: repository.owner.login,
    repo: repository.name,
    title: "Test",
    body: "This is a test pull request",
    head: "test",
    changes: [
      {
        files: {
          "README.md": "# Hello, there!",
        },
        commit: "Hello, there!",
      },
    ],
  });

  return [pullRequest.node_id];
}
