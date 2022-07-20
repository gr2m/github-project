import { Octokit } from "@octokit/core";
import { ConditionalKeys } from "type-fest";

export type BUILT_IN_FIELDS = {
  title: "Title";
  status: "Status";
};

type FieldOptionSettings = {
  name: string;
  optional?: boolean;
};
/** A project field can be set to a string name or an object of supported settings */
export type FieldOptions = string | FieldOptionSettings;

export default class GitHubProject<
  TCustomFields extends Record<string, FieldOptions> = {},
  TFields extends BUILT_IN_FIELDS = TCustomFields & BUILT_IN_FIELDS,
  TItemFields = Record<
    Exclude<keyof TFields, ConditionalKeys<TFields, { optional: true }>>,
    string | null
  > &
    Partial<Record<ConditionalKeys<TFields, { optional: true }>, string | null>>
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
    ): Promise<
      ProjectItem_PullRequest<TItemFields> | ProjectItem_Issue<TItemFields>
    >;
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

export type GitHubProjectOptions<
  TFields extends Record<string, FieldOptions> = {}
> =
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
  TFields extends {} = Record<keyof BUILT_IN_FIELDS, string | null>
> =
  | ProjectItem_Redacted<TFields>
  | ProjectItem_DraftIssue<TFields>
  | ProjectItem_PullRequest<TFields>
  | ProjectItem_Issue<TFields>;

type ProjectItem_Redacted<TFields> = {
  id: string;
  type: "REDACTED";
  fields: TFields;
};

type ProjectItem_DraftIssue<TFields> = {
  id: string;
  type: "DRAFT_ISSUE";
  fields: TFields;
};

type ProjectItem_PullRequest<TFields> = {
  id: string;
  type: "PULL_REQUEST";
  fields: TFields;
  content: PullRequest;
};

type ProjectItem_Issue<TFields> = {
  id: string;
  type: "ISSUE";
  fields: TFields;
  content: Issue;
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
  databaseId: number;
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
  dataType: string;

  /**
   * `options` is only set on `ProjectV2SingleSelectField`
   */
  options?: { id: string; name: string }[];
};

export type ProjectField =
  | ProjectFieldWithoutOptions
  | ProjectFieldWithOptions
  | OptionalNonExistingField;
export type ProjectFieldMap = Record<string, ProjectField>;

type ProjectFieldWithoutOptions = {
  id: string;
  name: string;
  userName: string;
  optional: boolean;
  existsInProject: true;
};
type ProjectFieldWithOptions = {
  id: string;
  name: string;
  userName: string;
  optionsById: Record<string, string>;
  optionsByValue: Record<string, string>;
  optional: boolean;
  existsInProject: true;
};
type OptionalNonExistingField = {
  userName: string;
  optional: true;
  existsInProject: false;
};

export type ProjectFieldValueNode = {
  value: string;
  /**
   * `field` is not set on built-in fields such as `"ProjectV2ItemFieldRepositoryValue"`
   */
  field?: {
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
  url: string;
  fields: ProjectFieldMap;
};

export type GitHubProjectStateWithItems = GitHubProjectStateCommon & {
  didLoadFields: true;
  didLoadItems: true;
  id: string;
  title: string;
  url: string;
  fields: ProjectFieldMap;
  items: GitHubProjectItem[];
};
