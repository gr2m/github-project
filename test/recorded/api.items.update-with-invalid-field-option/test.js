// @ts-check

/**
 * @param {import("../../../").default} project
 * @param {string} [itemId]
 */
export function test(project, itemId = "PVTI_1") {
  return project.items.update(itemId, { singleSelect: "<unknown>" }).then(
    () => {
      throw new Error("Expected error");
    },
    (error) => ({
      error,
      humanMessage: error.toHumanMessage(),
    })
  );
}
