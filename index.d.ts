import { Octokit } from "@octokit/core";

export type READ_ONLY_FIELDS = {
  title: "Title";
  assignees: "Assignees";
  labels: "Labels";
  repository: "Repository";
  milestone: "Milestone";
};

export default class GitHubProject<
  TFields extends Record<string, string> = {}
> {
  org: string;
  number: number;
  octokit: Octokit;
  fields: READ_ONLY_FIELDS & TFields;
  constructor(options: GitHubProjectOptions<TFields>);
}

export type GitHubProjectOptions<TFields extends Record<string, string> = {}> =
  {
    org: string;
    number: number;
    octokit: Octokit;
    fields?: TFields;
  };
