// @ts-check

/**
 * @param {import("../../..").default} project
 */
export function test(project) {
  // I_1 is the normalized Issue Node ID in `./fixtures.json`
  return project.items.getByContentId("I_1");
}
