import { Octokit } from "@octokit/core";

export type BUILT_IN_FIELDS = {
  title: "Title";
  status: "Status";
};

export default class GitHubProject<
  TCustomFields extends Record<string, string> = {},
  TFields extends BUILT_IN_FIELDS = TCustomFields & BUILT_IN_FIELDS,
  TItemFields = Record<keyof TFields, string | null>
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
    ): Promise<GitHubProjectItem<TItemFields> | undefined>;
    update(
      itemNodeId: string,
      fields: Partial<TItemFields>
    ): Promise<GitHubProjectItem<TItemFields> | undefined>;
    updateByContentId(
      contentNodeId: string,
      fields: Partial<TItemFields>
    ): Promise<GitHubProjectItem<TItemFields> | undefined>;
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

export type MatchFieldNameFn = (
  projectFieldName: string,
  userFieldName: string
) => boolean;
export type MatchFieldOptionValueFn = (
  fieldOptionValue: string,
  userValue: string
) => boolean;

export type GitHubProjectOptions<TFields extends Record<string, string> = {}> =
  | {
      org: string;
      number: number;
      token: string;
      fields?: TFields;
      matchFieldName?: MatchFieldNameFn;
      matchFieldOptionValue?: MatchFieldOptionValueFn;
    }
  | {
      org: string;
      number: number;
      octokit: Octokit;
      fields?: TFields;
      matchFieldName?: MatchFieldNameFn;
      matchFieldOptionValue?: MatchFieldOptionValueFn;
    };

export type GitHubProjectItem<
  TItemFields extends {} = Record<keyof BUILT_IN_FIELDS, string | null>
> = DraftItem<TItemFields> | NonDraftItem<TItemFields>;

type DraftItem<TFields> = {
  id: string;
  fields: TFields;
  isDraft: true;
};
type NonDraftItem<TFields> = {
  id: string;
  fields: TFields;
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
  title: string;
  url: string;
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

type GitHubProjectStateCommon = {
  matchFieldName: MatchFieldNameFn;
  matchFieldOptionValue: MatchFieldOptionValueFn;
};
type GitHubProjectStateInit = GitHubProjectStateCommon & {
  didLoadFields: false;
  didLoadItems: false;
};

export type GitHubProjectStateWithFields = GitHubProjectStateCommon & {
  didLoadFields: true;
  didLoadItems: false;
  id: string;
  title: string;
  description: string;
  url: string;
  fields: ProjectFieldMap;
};

export type GitHubProjectStateWithItems = GitHubProjectStateCommon & {
  didLoadFields: true;
  didLoadItems: true;
  id: string;
  title: string;
  description: string;
  url: string;
  fields: ProjectFieldMap;
  items: GitHubProjectItem[];
};
