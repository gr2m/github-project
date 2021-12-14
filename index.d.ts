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
  /** GitHub organization login */
  get org(): string;

  /** Project number */
  get number(): number;

  /** Octokit instance */
  get octokit(): Octokit;

  /** Map of fields */
  get fields(): READ_ONLY_FIELDS & TFields;

  constructor(options: GitHubProjectOptions<TFields>);
}

export type GitHubProjectOptions<TFields extends Record<string, string> = {}> =
  | {
      org: string;
      number: number;
      token: string;
      fields?: TFields;
    }
  | {
      org: string;
      number: number;
      octokit: Octokit;
      fields?: TFields;
    };
