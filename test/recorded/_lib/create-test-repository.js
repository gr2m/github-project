// @ts-check

/**
 * @param {import("@octokit/core").Octokit} octokit
 * @param {string} owner
 * @returns {Promise<import("@octokit/openapi-types").components["schemas"]["repository"]>}
 */
export async function createRepository(octokit, owner) {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/\D/g, "");
  const random = Math.random().toString(36).slice(2, 7);
  const name = ["test", timestamp, random].join("-");
  const { data: repository } = await octokit.request("POST /orgs/{org}/repos", {
    org: owner,
    name,
    auto_init: true,
  });

  return repository;
}
