// @ts-check

/**
 * @param {import("../../..").default} project
 * @param {string} [contentId]
 */
export async function test(project, contentId = "I_1") {
  const first = await project.items.archiveByContentId(contentId);
  // 2nd time it won't send a mutation
  const second = await project.items.archiveByContentId(contentId);
  // resolves with undefined if not found
  const third = await project.items.archiveByContentId("<unknown node id>");

  return [first, second, third];
}
