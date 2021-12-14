// @ts-check

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
  constructor({ org, number, octokit, fields = {} }) {
    this.org = org;
    this.number = number;
    this.octokit = octokit;
    this.fields = {
      ...fields,
      ...READ_ONLY_FIELDS,
    };
  }
}
