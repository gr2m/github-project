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
    this.org = org;
    this.number = number;
    this.fields = {
      ...fields,
      ...READ_ONLY_FIELDS,
    };

    if ("token" in options) {
      this.octokit = new Octokit({
        auth: options.token,
      });
    } else {
      this.octokit = options.octokit;
    }
  }
}
