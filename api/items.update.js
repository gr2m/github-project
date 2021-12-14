// @ts-check

import { getStateWithProjectItems } from "./lib/get-state-with-project-items.js";

/**
 * Updates item fields if the item can be found.
 *
 * Project item fields can only updated one at a time, so this methods sends
 * a single query including one mutation for each field that is updated.
 *
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} nodeId - `ProjectNextItem.id` or `ProjectNextItem.content.id`
 * @param {Record<string, string>} fields
 * @returns {Promise<import("..").GitHubProjectItem | undefined>}
 */
export default async function updateItem(project, state, nodeId, fields) {
  const stateWithItems = await getStateWithProjectItems(project, state);

  const item = stateWithItems.items.find(
    // @ts-expect-error - does not handle the conditional chaining operator
    (item) => item.id === nodeId || item.issueOrPullRequest?.id === nodeId
  );

  if (!item) return;

  const parts = Object.entries(fields)
    .map(([key, value]) => {
      if (value === undefined) return;
      const field = stateWithItems.fields[key];
      const valueOrOption =
        "optionsByValue" in field ? field.optionsByValue[value] : value;

      return `
        ${key}: updateProjectNextItemField(input: {projectId: $projectId, itemId: $itemId, fieldId: "${field.id}", value: "${valueOrOption}"}) {
          clientMutationId
        }
      `;
    })
    .filter(Boolean)
    .join("");

  const query = `
    mutation setItemProperties($projectId: ID!, $itemId: ID!) {
      ${parts}
    }
  `;

  await project.octokit.graphql(query, {
    projectId: stateWithItems.id,
    itemId: item.id,
  });

  // mutate item in cache
  item.fields = {
    ...item.fields,
    ...fields,
  };

  return item;
}
