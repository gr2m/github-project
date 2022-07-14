// @ts-check

/**
 * @param {InstanceType<typeof import("./octokit").default>} octokit
 */
export async function deleteAllTestRepositories(octokit, owner) {
  const repositoryNames = await octokit.paginate(
    "GET /orgs/{org}/repos",
    {
      org: owner,
    },
    (response) => {
      return response.data
        .map((repository) => repository.name)
        .filter((name) => name.startsWith("test-"));
    }
  );

  for (const repo of repositoryNames) {
    await octokit.request("DELETE /repos/{owner}/{repo}", {
      owner,
      repo,
    });
  }
}
