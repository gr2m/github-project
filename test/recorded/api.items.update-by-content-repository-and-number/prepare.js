// @ts-check

/**
 * Prepare state in order to record fixtures for test.js. Returns array of arguments that will be passed
 * passed as `test(project, ...arguments)`.
 *
 * @param {import("@octokit/openapi-types").components["schemas"]["repository"]} repository
 * @param {import("@octokit/core").Octokit} octokit
 * @param {import("../../..").default<{text: string, number: number, date: string, singleSelect: "One" | "Two" | "Three"}>} project
 *
 * @returns {Promise<[string, number]>}
 */
export async function prepare(repository, octokit, project) {
  // create a test issue
  const { data: issue } = await octokit.request(
    "POST /repos/{owner}/{repo}/issues",
    {
      owner: repository.owner.login,
      repo: repository.name,
      title: "Issue",
      body: "This is a test issue",
    }
  );

  // add issue to project
  await project.items.add(issue.node_id, {
    text: "text",
    number: "1",
    date: new Date("2020-02-02").toISOString(),
    singleSelect: "One",
  });

  return [repository.name, issue.number];
}
