// @ts-check

/**
 * @param {import("../..").ProjectFieldMap} projectFields
 * @param {import("../..").ProjectFieldValueNode[]} nodes
 * @returns {Record<string, string>}
 */
export function itemFieldsNodesToFieldsMap(projectFields, nodes) {
  return Object.entries(projectFields).reduce(
    (acc, [projectFieldName, projectField]) => {
      const rawValue =
        nodes.find((node) => node.projectField.id === projectField.id)?.value ||
        null;

      const value =
        "optionsById" in projectField
          ? projectField.optionsById[rawValue]
          : rawValue;

      return {
        ...acc,
        [projectFieldName]: value,
      };
    },
    {}
  );
}
