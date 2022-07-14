// @ts-check

/**
 * @param {import("../../../").default} project
 * @param {string} [contentId]
 */
export function test(project, contentId = "I_1") {
  return project.items.add(contentId, {
    text: "text",
    number: "1",
    singleSelect: "One",
    date: new Date("2020-02-02").toISOString(),
    status: "Done",
  });
}
