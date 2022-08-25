// @ts-check

/**
 * @param {import("../../../").default} project
 */
export function test(project) {
  return project.items.addDraft(
    {
      title: "Draft Title",
      body: "Draft Body",
    },
    {
      date: "2020-01-01",
      number: "123",
      singleSelect: "Two",
      status: "Done",
      text: "Some text",
      title: "the hack?",
    }
  );
}
