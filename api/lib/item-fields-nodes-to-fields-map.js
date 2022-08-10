/**
 * @param {import("../..").GitHubProjectStateWithFields | import("../..").GitHubProjectStateWithItems} state
 * @param {import("../..").ProjectFieldValueNode[]} nodes
 * @returns {Record<keyof import("../..").BUILT_IN_FIELDS, string> & Record<string, string>}
 */
export function itemFieldsNodesToFieldsMap(state, nodes) {
  return Object.entries(state.fields).reduce(
    (acc, [projectFieldName, projectField]) => {
      // don't set optional fields on items that don't exist in project
      if (projectField.existsInProject === false) return acc;

      const node = nodes.find((node) => node.field?.id === projectField.id);
      const value = projectFieldValueNodeToValue(projectField, node);

      return {
        ...acc,
        [projectFieldName]: value,
      };
    },
    {}
  );
}

/**
 * @param {import("../..").ProjectField} projectField
 * @param {import("../..").ProjectFieldValueNode} node
 * @returns {string}
 */
function projectFieldValueNodeToValue(projectField, node) {
  if (!node) return null;

  switch (node.__typename) {
    case "ProjectV2ItemFieldDateValue":
      return node.date;
    case "ProjectV2ItemFieldNumberValue":
      // we currently only work with strings
      return String(node.number);
    case "ProjectV2ItemFieldSingleSelectValue":
      return projectField.optionsById[node.optionId];
    case "ProjectV2ItemFieldTextValue":
      return node.text;
    // TODO: implement iteration fields
    // case "ProjectV2ItemFieldIterationValue":
    // return null;
  }
}
