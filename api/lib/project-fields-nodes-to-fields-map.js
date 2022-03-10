// @ts-check

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
 * Takes the list of fields nodes from the GraphQL query result:
 *
 * ```
 * fields(...) {
 *   nodes {
 *     id
 *     name
 *     settings
 *   }
 * }
 * ```
 *
 * and turns them into a map
 *
 * ```
 * {
 *   "title": {
 *     "id": "<project field node id 1>",
 *     "name": "Title",
 *   },
 *   "status": {
 *     "id": "<project field node id 2>",
 *     "name": "Status",
 *     "optionsByValue": {
 *       "In Progress": "<option node id 1>",
 *       "Ready": "<option node id 2>",
 *       "Done": "<option node id 3>",
 *     },
 *     "optionsById": {
 *       "<option node id 1>": "In Progress",
 *       "<option node id 2>": "Ready",
 *       "<option node id 3>": "Done",
 *     },
 *   },
 *   "myCustomField": {
 *     "id": "<project field node id 3>",
 *     "name": "My Custom Field",
 *   },
 * }
 * ```
 *
 * @param {import("../..").default} project
 * @param {import("../..").ProjectFieldNode[]} nodes
 * @returns {import("../..").ProjectFieldMap}
 */
export function projectFieldsNodesToFieldsMap(project, nodes) {
  return nodes.reduce((acc, node) => {
    if (READ_ONLY_FIELDS.includes(node.name)) {
      return acc;
    }

    const key = fieldNameToInternalName(project, node.name);
    if (!key) return acc;

    acc[key] = {
      id: node.id,
      name: node.name,
    };

    // Settings is a JSON string. It contains view information such as column width.
    // If the field is of type "Single select", then the `options` property will be set.
    const settings = JSON.parse(node.settings);
    if (settings?.options) {
      acc[key].optionsById = settings.options.reduce((acc, option) => {
        return {
          ...acc,
          [option.id]: option.name,
        };
      }, {});
      acc[key].optionsByValue = settings.options.reduce((acc, option) => {
        return {
          ...acc,
          [option.name]: option.id,
        };
      }, {});
    }

    return acc;
  }, {});
}

/**
 * Returns internal name for a project field
 *
 * @param {import('../..').default} project
 * @param {string} name
 * @returns string | undefined
 */
function fieldNameToInternalName(project, name) {
  const result = Object.entries(project.fields).find(
    ([, value]) => value.toLowerCase() === name.toLowerCase()
  );

  if (!result) return;

  return result[0];
}
