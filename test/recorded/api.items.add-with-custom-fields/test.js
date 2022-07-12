// @ts-check

/**
 * @param {import("../../../").default} project
 * @param {string} itemId
 */
export function test(project, itemId = "PNI_1") {
  return project.items.add(itemId, {
    text: "text",
    number: "1",
    singleSelect: "One",
    date: new Date("2020-02-02").toISOString(),
    status: "Done",
  });
}
