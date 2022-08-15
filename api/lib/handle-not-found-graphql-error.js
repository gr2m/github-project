// @ts-check

export function handleNotFoundGraphqlError(error) {
  /* c8 ignore next */
  if (!error.errors) throw error;
  if (error.errors[0].type === "NOT_FOUND") return;
  /* c8 ignore next 2 */
  throw error;
}
