import { Octokit } from "@octokit/core";

type NullableValues<T extends {}> = { [K in keyof T]: T[K] | null };

export type BUILT_IN_FIELDS = {
  title: "Title";
  status: "Status";
};

export default class GitHubProject<
  TCustomFields extends Record<string, string> = {},
  TFields extends {} = TCustomFields & BUILT_IN_FIELDS,
  TItemFields = Record<keyof TFields, string>
> {
  /** GitHub organization login */
  get org(): string;

  /** Project number */
  get number(): number;

  /** Octokit instance */
  get octokit(): Octokit;

  /** Map of fields */
  get fields(): TFields;

  constructor(options: GitHubProjectOptions<TCustomFields>);

  items: {
    list(): Promise<GitHubProjectItem<TItemFields>[]>;
    add(
      contentNodeId: string,
      fields?: Partial<TItemFields>
    ): Promise<NonDraftItem<TItemFields>>;
    get(
      itemNodeId: string
    ): Promise<GitHubProjectItem<TItemFields> | undefined>;
    getByContentId(
      contentNodeId: string
    ): Promise<GitHubProjectItem<TItemFields> | undefined>;
    getByContentRepositoryAndNumber(
      repositoryName: string,
      issueOrPullRequestNumber: number
    ): Promise<GitHubProjectItem<TFields> | undefined>;
    update(
      itemNodeId: string,
      fields: Partial<TItemFields>
    ): Promise<GitHubProjectItem<TFields> | undefined>;
    updateByContentId(
      contentNodeId: string,
      fields: Partial<TItemFields>
    ): Promise<GitHubProjectItem<TFields> | undefined>;
    updateByContentRepositoryAndNumber(
      repositoryName: string,
      issueOrPullRequestNumber: number,
      fields: Partial<TItemFields>
    ): Promise<GitHubProjectItem<TItemFields> | undefined>;
    remove(itemNodeId: string): Promise<void>;
    removeByContentId(contentNodeId: string): Promise<void>;
    removeByContentRepositoryAndNumber(
      repositoryName: string,
      issueOrPullRequestNumber: number
    ): Promise<void>;
  };
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

export type GitHubProjectItem<TFields extends Record<string, string> = {}> =
  | DraftItem<TFields>
  | NonDraftItem<TFields>;

type DraftItem<TFields> = {
  id: string;
  fields: NullableValues<TFields>;
  isDraft: true;
};
type NonDraftItem<TFields> = {
  id: string;
  fields: NullableValues<TFields>;
  isDraft: false;
  content: Issue | PullRequest;
};

type Issue = contentCommon & {
  isIssue: true;
  isPullRequest: false;
};
type PullRequest = contentCommon & {
  isIssue: false;
  isPullRequest: true;
  merged: boolean;
};

type contentCommon = {
  id: string;
  number: number;
  createdAt: string;
  closed: boolean;
  closedAt?: string;
  assignees: string[];
  labels: string[];
  repository: string;
  milestone: {
    title: string;
    number: number;
    state: "OPEN" | "CLOSED";
  };
};

export type ProjectFieldNode = {
  id: string;
  name: string;
  /**
   * Settings is a JSON string. It contains view information such as column width.
   * If the field is of type "Single select", then the `options` property will be set.
   */
  settings: string;
};

export type ProjectFieldMap = Record<
  string,
  ProjectField | ProjectFieldWithOptions
>;

type ProjectField = { id: string; name: string };
type ProjectFieldWithOptions = {
  id: string;
  name: string;
  optionsById: Record<string, string>;
  optionsByValue: Record<string, string>;
};

export type ProjectFieldValueNode = {
  value: string;
  projectField: {
    id: string;
    name: string;
  };
};

export type GitHubProjectState =
  | GitHubProjectStateInit
  | GitHubProjectStateWithFields
  | GitHubProjectStateWithItems;

type GitHubProjectStateInit = {
  didLoadFields: false;
  didLoadItems: false;
};

export type GitHubProjectStateWithFields = {
  didLoadFields: true;
  didLoadItems: false;
  id: string;
  title: string;
  description: string;
  url: string;
  fields: ProjectFieldMap;
};

export type GitHubProjectStateWithItems = {
  didLoadFields: true;
  didLoadItems: true;
  id: string;
  title: string;
  description: string;
  url: string;
  fields: ProjectFieldMap;
  items: GitHubProjectItem[];
};
