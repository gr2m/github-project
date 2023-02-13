// @ts-check

/**
 * Takes a GraphQL `projectItem` node and returns a `ProjectItem` object
 * in the format we return it from the GitHubProject API.
 *
 * @param {import("../..").GitHubProjectStateWithFields} state
 * *
 * @returns {import("../..").GitHubProjectProperties}
 */
export function projectNodeToProperties(state) {
  return {
    databaseId: state.databaseId,
    id: state.id,
    title: state.title,
    url: state.url,
  };
}
