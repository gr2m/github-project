// @ts-check

/**
 * @param {import("../../..").default} project
 */
export function test(project) {
  return project.items.addDraft({ title: "test" }, { date: "<invalid>" }).then(
    () => {
      throw new Error("Expected error");
    },
    (error) => ({
      error,
      humanMessage: error.toHumanMessage(),
    })
  );
}
