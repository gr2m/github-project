// @ts-check

/**
 * @param {NodeJS.ProcessEnv} env
 * @param {import("@octokit/core").Octokit} octokit
 * @param {string} owner
 * @param {string} testName
 * @returns {Promise<import("@octokit/openapi-types").components["schemas"]["repository"]>}
 */
export async function createRepository(env, octokit, owner, testName) {
  const prefix = env.TEST_REPSITORY_NAME_PREFIX;
  const timestamp = new Date().toISOString().slice(0, 19).replace(/\D/g, "");
  const name = [prefix, "test", testName, timestamp].filter(Boolean).join("-");
  const { data: repository } = await octokit.request("POST /orgs/{org}/repos", {
    org: owner,
    name,
    auto_init: true,
  });

  return repository;
}
