/**
 * @param {string} projectValue
 * @param {string} userValue
 * @returns boolean
 */
export function defaultMatchFunction(projectValue, userValue) {
  return projectValue === userValue;
}
