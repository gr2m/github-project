// @ts-check

/**
 * Takes `project.fields` and the list of fields nodes from the GraphQL query result:
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
 * @param {import("../..").GitHubProjectState} state
 * @param {import("../..").default} project
 * @param {import("../..").ProjectFieldNode[]} nodes
 * @returns {import("../..").ProjectFieldMap}
 */
export function projectFieldsNodesToFieldsMap(state, project, nodes) {
  return Object.entries(project.fields).reduce(
    (acc, [userInternalFieldName, userFieldNameOrConfig]) => {
      const fieldOptional =
        typeof userFieldNameOrConfig === "object" &&
        userFieldNameOrConfig.optional;
      const userFieldName =
        userFieldNameOrConfig?.name || userFieldNameOrConfig;

      const node = nodes.find((node) =>
        state.matchFieldName(
          node.name.toLowerCase(),
          userFieldName.toLowerCase().trim()
        )
      );

      if (!node) {
        const projectFieldNames = nodes
          .map((node) => `"${node.name}"`)
          .join(", ");
        if (!fieldOptional) {
          throw new Error(
            `[github-project] "${userFieldName}" could not be matched with any of the existing field names: ${projectFieldNames}`
          );
        }
        project.octokit.log.info(
          `[github-project] optional field "${userFieldName}" was not matched with any existing field names: ${projectFieldNames}`
        );
        return acc;
      }

      acc[userInternalFieldName] = {
        id: node.id,
        name: node.name,
        userName: userFieldName,
      };

      // Settings is a JSON string. It contains view information such as column width.
      // If the field is of type "Single select", then the `options` property will be set.
      const settings = JSON.parse(node.settings);
      if (settings?.options) {
        acc[userInternalFieldName].optionsById = settings.options.reduce(
          (acc, option) => {
            return {
              ...acc,
              [option.id]: option.name,
            };
          },
          {}
        );
        acc[userInternalFieldName].optionsByValue = settings.options.reduce(
          (acc, option) => {
            return {
              ...acc,
              [option.name]: option.id,
            };
          },
          {}
        );
      }

      return acc;
    },
    {}
  );
}
