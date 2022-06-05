// @ts-check

import { queryItemFieldNodes } from "./queries.js";

/**
 * List of field names that are returned by the GraphQL API as project fields
 * but are in fact properties of issue/pull request objects instead.
 */
const READ_ONLY_FIELDS = [
  "Assignees",
  "Labels",
  "Linked Pull Requests",
  "Milestone",
  "Repository",
  "Reviewers",
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
    .filter(([, value]) =>
      READ_ONLY_FIELDS.some((readOnlyField) =>
        state.matchFieldName(
          readOnlyField.toLowerCase(),
          value.toLowerCase().trim()
        )
      )
    );

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
          ? findFieldOptionId(state, field, value)
          : value;

      const queryNodes =
        mustLoadItemProperties && index === 0
          ? `projectNextItem { ${queryItemFieldNodes} }`
          : "clientMutationId";

      return `
        ${key.replace(
          /\s+/g,
          ""
        )}: updateProjectNextItemField(input: {projectId: $projectId, itemId: $itemId, fieldId: "${
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
  // TODO: add test for when `str` is not a "string"
  /* c8 ignore next */
  return typeof str === "string" ? str.replace(/\"/g, '\\"') : str;
}

/**
 * @param {import("../..").GitHubProjectStateWithFields | import("../..").GitHubProjectStateWithItems} state
 * @param {import("../..").ProjectFieldWithOptions} field
 * @param {string} value
 *
 * @returns {string}
 */
function findFieldOptionId(state, field, value) {
  const [_optionValue, optionId] =
    Object.entries(field.optionsByValue).find(([optionValue]) =>
      state.matchFieldOptionValue(optionValue, value.trim())
    ) || [];

  if (!optionId) {
    const knownOptions = Object.keys(field.optionsByValue);
    const existingOptionsString = knownOptions
      .map((value) => `- ${value}`)
      .join("\n");

    throw Object.assign(
      new Error(
        `[github-project] "${value}" is an invalid option for "${field.name}".\n\nKnown options are:\n${existingOptionsString}`
      ),
      {
        code: "E_GITHUB_PROJECT_UNKNOWN_FIELD_OPTION",
        knownOptions,
        userOption: value,
      }
    );
  }

  return optionId;
}
