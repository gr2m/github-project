// @ts-check

/**
 * @param {NodeJS.ProcessEnv} env
 * @param {InstanceType<typeof import("./octokit").default>} octokit
 */
export async function deleteAllTestRepositories(env, octokit, owner) {
  const prefix = env.TEST_REPSITORY_NAME_PREFIX
    ? `${env.TEST_REPSITORY_NAME_PREFIX}-test-`
    : "test-";
  const repositoryNames = await octokit.paginate(
    "GET /orgs/{org}/repos",
    {
      org: owner,
    },
    (response) => {
      return response.data
        .map((repository) => repository.name)
        .filter((name) => name.startsWith(prefix));
    }
  );

  for (const repo of repositoryNames) {
    await octokit.request("DELETE /repos/{owner}/{repo}", {
      owner,
      repo,
    });
  }
}
