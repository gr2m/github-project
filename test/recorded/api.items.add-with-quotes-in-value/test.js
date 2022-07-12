// @ts-check

/**
 * @param {import("../../../").default} project
 * @param {string} itemId
 */
export function test(project, itemId = "I_1") {
  return project.items.add(itemId, {
    text: 'Is "it"?',
  });
}
