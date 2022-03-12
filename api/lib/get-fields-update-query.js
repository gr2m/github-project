// @ts-check

import { queryItemFieldNodes } from "./queries.js";

/**
 * List of field names that are returned by the GraphQL API as project fields
 * but are in fact properties of issue/pull request objects instead.
 */
const READ_ONLY_FIELDS = [
  "assignees",
  "labels",
  "linked pull requests",
  "milestone",
  "repository",
  "reviewers",
];

/**
 * Project item fields can only updated one at a time, so this methods sends
 * a single query including one mutation for each field that is updated.
 *
 * When updating an item using the item node ID, there is no need to download
 * all items for lookup first. However, we still want to respond with the full
 * item with all fields and content properties, so we we load them as part of
 * the first updated property.
 *
 * @param {import("../..").GitHubProjectStateWithFields | import("../..").GitHubProjectStateWithItems} state
 * @param {Record<string, string>} fields
 * @returns {string}
 */
export function getFieldsUpdateQuery(state, fields) {
  const readOnlyFields = Object.keys(fields)
    .map((key) => [key, state.fields[key].name])
    .filter(([, value]) => READ_ONLY_FIELDS.includes(value.toLowerCase()));

  if (readOnlyFields.length > 0) {
    throw new Error(
      `[github-project] Cannot update read-only fields: ${readOnlyFields
        .map(([key, value]) => `"${value}" (.${key})`)
        .join(", ")}`
    );
  }

  const mustLoadItemProperties = !state.didLoadItems;
  const parts = Object.entries(fields)
    .map(([key, value], index) => {
      if (value === undefined) return;
      const field = state.fields[key];
      const valueOrOption =
        value === null
          ? ""
          : "optionsByValue" in field
          ? field.optionsByValue[value]
          : value;

      const queryNodes =
        mustLoadItemProperties && index === 0
          ? `projectNextItem { ${queryItemFieldNodes} }`
          : "clientMutationId";

      return `
        ${key}: updateProjectNextItemField(input: {projectId: $projectId, itemId: $itemId, fieldId: "${
        field.id
      }", value: "${escapeQuotes(valueOrOption)}"}) {
          ${queryNodes}
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

function escapeQuotes(str) {
  return typeof str === "string" ? str.replace(/\"/g, '\\"') : str;
}
