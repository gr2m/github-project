// @ts-check

import { getStateWithProjectFields } from "./lib/get-state-with-project-fields.js";
import { projectItemNodeToGitHubProjectItem } from "./lib/project-item-node-to-github-project-item.js";
import { getItemByContentRepositoryAndNameQuery } from "./lib/queries.js";

/**
 * Find an item based on the repository and issues/pull request number.
 * Resolves with `undefined` if item could not be found.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} repositoryName
 * @param {number} issueOrPullRequestNumber
 * @returns {Promise<import("..").GitHubProjectItem | undefined>}
 */
export async function getItemByContentRepositoryAndNumber(
  project,
  state,
  repositoryName,
  issueOrPullRequestNumber
) {
  const stateWithFields = await getStateWithProjectFields(project, state);

  try {
    // TODO: ideally we would retrieve a project item directly based on a content id
    //       and the project number, but GitHub's GraphQL Schema does not support that
    //       as of 2022-08-14. As a workaround, we load all project items and filter
    //       them by project number afterwards.
    const {
      repositoryOwner: {
        repository: {
          issueOrPullRequest: {
            projectItems: { nodes },
          },
        },
      },
    } = await project.octokit.graphql(getItemByContentRepositoryAndNameQuery, {
      owner: project.owner,
      repositoryName: repositoryName,
      number: issueOrPullRequestNumber,
    });

    const node = nodes.find((node) => node.project.number === project.number);

    if (!node) return;

    return projectItemNodeToGitHubProjectItem(stateWithFields, node);
  } catch (error) {
    /* c8 ignore next */
    if (!error.errors) throw error;
    if (error.errors[0].type === "NOT_FOUND") return;
    /* c8 ignore next 2 */
    throw error;
  }
}
