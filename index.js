// @ts-check

import { Octokit } from "@octokit/core";

/** @type {import("./").READ_ONLY_FIELDS} */
export const READ_ONLY_FIELDS = {
  title: "Title",
  assignees: "Assignees",
  labels: "Labels",
  repository: "Repository",
  milestone: "Milestone",
};

export default class GitHubProject {
  org;
  number;
  octokit;
  fields;

  /**
   * @param {import(".").GitHubProjectOptions} options
   */
  constructor(options) {
    const { org, number, fields = {} } = options;
    const octokit =
      "token" in options
        ? new Octokit({ auth: options.token })
        : options.octokit;

    Object.defineProperties(this, {
      org: { get: () => org },
      number: { get: () => number },
      fields: { get: () => ({ ...fields, ...READ_ONLY_FIELDS }) },
      octokit: { get: () => octokit },
    });
  }
}
