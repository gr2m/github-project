/**
 * Maximum text field value length is 1024 bytes. By default, we don't do anything.
 *
 * @param {string} text
 * @returns {string}
 */
export function defaultTruncateFunction(text) {
  return text;
}
