// @ts-check

/**
 * @param {import("../../..").default} project
 */
export async function test(project) {
  // this should not fail, 1024 is the limit
  await project.items.addDraft(
    { title: "1024 length test" },
    { text: ".".repeat(1024) }
  );

  // this should fail
  return project.items
    .addDraft({ title: "1025 length test" }, { text: ".".repeat(1025) })
    .then(
      () => {
        throw new Error("Expected error");
      },
      (error) => ({
        error,
        // humanMessage: error.toHumanMessage(),
      })
    );
}
