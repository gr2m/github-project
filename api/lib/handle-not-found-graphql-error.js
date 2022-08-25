// @ts-check

/**
 * @param {any} error - error object thrown by `octokit.graphql()`
 * @returns void
 */
export function handleNotFoundGraphqlError(error) {
  /* c8 ignore next */
  if (!error.errors) throw error;
  if (error.errors[0].type === "NOT_FOUND") return;
  /* c8 ignore next 2 */
  throw error;
}
