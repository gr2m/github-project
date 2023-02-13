// @ts-check

/**
 * @param {import("../../..").default} project
 * @param {string} [itemId]
 */
export async function test(project, itemId = "PVTI_1") {
  const first = await project.items.archive(itemId);
  // 2nd time it won't send a mutation
  const second = await project.items.archive(itemId);
  // resolves with undefined if not found
  const third = await project.items.archive("<unknown node id>");

  return [first, second, third];
}
