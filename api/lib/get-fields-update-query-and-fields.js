// @ts-check

import {
  GitHubProjectUnknownFieldOptionError,
  GitHubProjectUpdateReadOnlyFieldError,
} from "../../index.js";
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
 * Project item fields can only be updated one at a time, so this methods sends
 * a single query including one mutation for each field that is updated.
 *
 * When updating an item using the item node ID, there is no need to download
 * all items for lookup first. However, we still want to respond with the full
 * item with all fields and content properties, so we load them as part of
 * the first updated property.
 *
 * This function returns both the query and the fields that are updated, because
 * the fields can differ from what the user set, as field option matching can
 * be customized by the user using the `matchFieldOptionValue` constructor
 * option. For example, the user might set a single select field to "1" while
 * the actual value is set to "One" in the project.
 *
 * @param {import("../..").GitHubProjectStateWithFields} state
 * @param {Record<string, string>} fields
 *
 * @returns {{query: string, fields: Record<string, string>}}
 */
export function getFieldsUpdateQueryAndFields(state, fields) {
  // When updating fields convert empty strings to null to ensure that the field's value
  // is correctly unset. This is important for date fields, which fail validation if
  // an empty string is passed.
  const existingFields = Object.fromEntries(
    Object.keys(fields)
      .filter((key) => state.fields[key].existsInProject)
      .map((key) => [key, fields[key] === "" ? null : fields[key]])
  );

  const readOnlyFields = Object.entries(existingFields)
    .map(([id, userValue]) => ({
      id,
      // @ts-expect-error - assume state.fields[id] is not OptionalNonExistingField
      name: String(state.fields[id].name),
      userName: state.fields[id].userName,
      userValue,
    }))
    .filter(({ id, name }) => {
      const field = state.fields[id];
      return READ_ONLY_FIELDS.some((readOnlyField) => {
        return state.matchFieldName(
          readOnlyField.toLowerCase(),

          name.toLowerCase().trim()
        );
      });
    });

  if (readOnlyFields.length > 0) {
    throw new GitHubProjectUpdateReadOnlyFieldError({
      fields: readOnlyFields,
    });
  }

  /** @type {Record<string, {query: string, key: string, value: string|undefined}>[]} */
  // @ts-expect-error - TS doesn't handle `.filter(Boolean)` correctly
  const parts = Object.entries(existingFields)
    .map(([key, value], index) => {
      if (value === undefined) return;
      const field = state.fields[key];
      const alias = key.replace(/[^\w\d]/g, "");
      // @ts-expect-error - `field.id` is not set if field does not exist on projects, but we know it exists here
      const fieldId = field.id;
      // only retrieve the updated node once
      const queryNodes =
        index === 0
          ? `projectV2Item { ${queryItemFieldNodes} }`
          : "clientMutationId";

      if (value === null) {
        // https://docs.github.com/en/graphql/reference/mutations#clearprojectv2itemfieldvalue
        const query = `
          ${alias}: clearProjectV2ItemFieldValue(input: {projectId: $projectId, itemId: $itemId, fieldId: "${fieldId}"}) {
            ${queryNodes}
          }
        `;

        return {
          query,
          key,
          value: null,
        };
      } else {
        const valueOrOption =
          "optionsByValue" in field
            ? findFieldOptionIdAndValue(state, field, value)
            : value;

        const query = `
          ${alias}: updateProjectV2ItemFieldValue(input: {projectId: $projectId, itemId: $itemId, fieldId: "${fieldId}", ${toItemFieldValueInput(
            field,
            valueOrOption
          )}}) {
            ${queryNodes}
          }
        `;

        return {
          query,
          key,
          value:
            typeof valueOrOption === "string"
              ? valueOrOption
              : valueOrOption.value,
        };
      }
    })
    .filter(Boolean);

  return {
    query: `
      mutation setItemProperties($projectId: ID!, $itemId: ID!) {
        ${parts
          .map((part) => {
            return part.query;
          })
          .join("\n")}
      }
    `,

    fields: Object.fromEntries(parts.map((part) => [part.key, part.value])),
  };
}

/**
 * @param {import("../..").ProjectField} field
 * @param {string | {id: string, value: string | undefined}} valueOrOption
 *
 * @returns {string}
 */
function toItemFieldValueInput(field, valueOrOption) {
  const value =
    typeof valueOrOption === "string" ? valueOrOption : valueOrOption.id;

  const valueKey =
    {
      SINGLE_SELECT: "singleSelectOptionId",
      NUMBER: "number",
      DATE: "date",
      ITERATION: "iterationId",
    }[field.dataType] || "text";

  if (valueKey === "number") {
    return `value: {number: ${parseFloat(value)}}`;
  }

  return `value: {${valueKey}: "${escapeQuotes(value)}"}`;
}

function escapeQuotes(str) {
  // TODO: add test for when `str` is not a "string"
  /* c8 ignore next */
  return typeof str === "string" ? str.replace(/\"/g, '\\"') : str;
}

/**
 * We retrieve both the internal option ID as well as the actual option value
 * as users can set custom value matching using the `matchFieldOptionValue`
 * constructor option
 *
 * @param {import("../..").GitHubProjectStateWithFields} state
 * @param {import("../..").ProjectFieldWithOptions} field
 * @param {string} value
 *
 * @returns {{id: string, value: string | undefined}}
 */
function findFieldOptionIdAndValue(state, field, value) {
  const [optionValue, optionId] =
    Object.entries(field.optionsByValue).find(([optionValue]) =>
      state.matchFieldOptionValue(optionValue, value.trim())
    ) || [];

  if (!optionId) {
    const options = Object.entries(field.optionsByValue).map(([name, id]) => {
      return { name, id };
    });

    throw new GitHubProjectUnknownFieldOptionError({
      field: {
        id: field.id,
        name: field.name,
        type: "SINGLE_SELECT",
        options,
      },
      userValue: value,
    });
  }

  return { id: optionId, value: optionValue };
}
