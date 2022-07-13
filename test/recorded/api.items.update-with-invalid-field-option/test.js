// @ts-check

/**
 * @param {import("../../../").default} project
 * @param {string} itemId
 */
export function test(project, itemId = "PNI_1") {
  return project.items.update(itemId, { singleSelect: "<unknown>" }).then(
    () => {
      throw new Error("Expected error");
    },
    (error) => error
  );
}
