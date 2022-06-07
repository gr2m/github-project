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

      const rawValue =
        nodes.find((node) => node.projectField.id === projectField.id)?.value ||
        null;

      const value =
        "optionsById" in projectField
          ? projectField.optionsById[rawValue] || null
          : rawValue;

      return {
        ...acc,
        [projectFieldName]: value,
      };
    },
    {}
  );
}
