/**
 * @param {import("../..").GitHubProjectStateWithFields | import("../..").GitHubProjectStateWithItems} state
 * @param {import("../..").ProjectFieldValueNode[]} nodes
 * @returns {import("../..").BUILT_IN_FIELDS & Record<string, string>}
 */
export function itemFieldsNodesToFieldsMap(state, nodes) {
  return Object.entries(state.fields).reduce(
    (acc, [projectFieldName, projectField]) => {
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
