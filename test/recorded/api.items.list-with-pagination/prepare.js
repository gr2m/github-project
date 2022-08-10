// @ts-check

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
 *
 * @returns {Promise<[]>}
 */
export async function prepare(repository, octokit, project) {
  // We load 100 items at a time, and we have two separate queries and hence
  // two separate places where we check if there are more items, so we need
  // to create 201 items for this test ...
  const createIssuesCount = 201;

  console.log(
    `Creating ${createIssuesCount} issues and adding them to the project. This will take a while...`
  );

  for (let number = 1; number <= createIssuesCount; number++) {
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
      number: String(number),
      date: new Date("2020-02-02").toISOString(),
      singleSelect: "One",
    });
  }

  return [];
}
