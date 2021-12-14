// @ts-check

import { Octokit } from "@octokit/core";

import listItems from "./api/items.list.js";
import addItem from "./api/items.add.js";

/** @type {import("./").BUILT_IN_FIELDS} */
export const BUILT_IN_FIELDS = {
  title: "Title",
  status: "Status",
};

export default class GitHubProject {
  /**
   * @param {import(".").GitHubProjectOptions} options
   */
  constructor(options) {
    const { org, number, fields = {} } = options;

    // set octokit either from `options.octokit` or `options.token`
    const octokit =
      "token" in options
        ? new Octokit({ auth: options.token })
        : options.octokit;

    // set API
    const itemsApi = {
      list: listItems.bind(null, this),
      add: addItem.bind(null, this),
    };
    Object.defineProperties(this, {
      org: { get: () => org },
      number: { get: () => number },
      fields: { get: () => ({ ...fields, ...BUILT_IN_FIELDS }) },
      octokit: { get: () => octokit },
      items: { get: () => itemsApi },
    });
  }
}
