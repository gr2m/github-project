// @ts-check

/**
 * Project item fields can only updated one at a time, so this methods sends
 * a single query including one mutation for each field that is updated.
 *
 * @param {import("../..").GitHubProjectStateWithFields | import("../..").GitHubProjectStateWithItems} state
 * @param {Record<string, string>} fields
 * @returns {string}
 */
export function getFieldsUpdateQuery(state, fields) {
  const parts = Object.entries(fields)
    .map(([key, value]) => {
      if (value === undefined) return;
      const field = state.fields[key];
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

  return `
    mutation setItemProperties($projectId: ID!, $itemId: ID!) {
      ${parts}
    }
  `;
}
