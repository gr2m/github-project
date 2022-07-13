/**
 * Prepare state in order to record fixtures for test.js. Returns array of arguments that will be passed
 * passed as `test(project, ...arguments)`.
 *
 * For this test we reuse a special, persistant repository and project, as we need 101 issued and project
 * items in order to test pagination. Instead of creating all the items each time we record from scratch,
 * we check if the `special-test-pagination` repository exists
 *
 * @param {import("@octokit/openapi-types").components["schemas"]["repository"]} repository
 * @param {import("@octokit/core").Octokit} octokit
 * @param {import("../../..").default<{text: string, number: number, date: string, singleSelect: "One" | "Two" | "Three"}>} project
 * @returns {Promise<[string]>}
 */
export async function prepare(repository, octokit, project) {
  console.log(
    "Creating 101 issues and adding them to the project. This will take a while..."
  );
  // We load 100 items at a time, so we need to create 101 items for this test ...
  for (let number = 1; number <= 101; number++) {
    // create test issue 1
    const { data: issue } = await octokit.request(
      "POST /repos/{owner}/{repo}/issues",
      {
        owner: repository.owner.login,
        repo: repository.name,
        title: "Issue " + number,
        body: "This is a test issue",
      }
    );

    // add issue to project
    await project.items.add(issue.node_id, {
      text: "text",
      number,
      date: new Date("2020-02-02").toISOString(),
      singleSelect: "One",
    });
  }

  return [];
}
