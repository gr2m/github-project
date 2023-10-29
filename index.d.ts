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

export type DraftItemContent = {
  title: string;
  body?: string;
  assigneeIds?: string[];
};

export type GitHubProjectProperties = {
  databaseId: string;
  id: string;
  title: string;
  url: string;
};

export default class GitHubProject<
  TCustomFields extends Record<string, FieldOptions> = {},
  TFields extends BUILT_IN_FIELDS = TCustomFields & BUILT_IN_FIELDS,
  TItemFields extends {} = Record<
    Exclude<keyof TFields, ConditionalKeys<TFields, { optional: true }>>,
    string | null
  > &
    Partial<
      Record<ConditionalKeys<TFields, { optional: true }>, string | null>
    >,
> {
  /** Project owner login */
  get owner(): string;

  /** Project number */
  get number(): number;

  /** Octokit instance */
  get octokit(): Octokit;

  /** Map of fields */
  get fields(): TFields;

  /** Project properties */
  getProperties(): Promise<GitHubProjectProperties>;

  static getInstance<
    TCustomFields extends Record<string, FieldOptions> = {},
    TFields extends BUILT_IN_FIELDS = TCustomFields & BUILT_IN_FIELDS,
    TItemFields extends {} = Record<
      Exclude<keyof TFields, ConditionalKeys<TFields, { optional: true }>>,
      string | null
    > &
      Partial<
        Record<ConditionalKeys<TFields, { optional: true }>, string | null>
      >,
  >(
    options: GitHubProjectOptions<TCustomFields>,
  ): Promise<GitHubProject<TCustomFields, TFields, TItemFields>>;

  constructor(options: GitHubProjectOptions<TCustomFields>);

  items: {
    list(): Promise<GitHubProjectItem<TItemFields>[]>;
    addDraft(
      content: DraftItemContent,
      fields?: Partial<TItemFields>,
    ): Promise<ProjectItem_DraftIssue<TItemFields>>;
    add(
      contentNodeId: string,
      fields?: Partial<TItemFields>,
    ): Promise<
      ProjectItem_PullRequest<TItemFields> | ProjectItem_Issue<TItemFields>
    >;
    get(
      itemNodeId: string,
    ): Promise<GitHubProjectItem<TItemFields> | undefined>;
    getByContentId(
      contentNodeId: string,
    ): Promise<GitHubProjectItem<TItemFields> | undefined>;
    getByContentRepositoryAndNumber(
      repositoryName: string,
      issueOrPullRequestNumber: number,
    ): Promise<GitHubProjectItem<TItemFields> | undefined>;
    update(
      itemNodeId: string,
      fields: Partial<TItemFields>,
    ): Promise<GitHubProjectItem<TItemFields> | undefined>;
    updateByContentId(
      contentNodeId: string,
      fields: Partial<TItemFields>,
    ): Promise<GitHubProjectItem<TItemFields> | undefined>;
    updateByContentRepositoryAndNumber(
      repositoryName: string,
      issueOrPullRequestNumber: number,
      fields: Partial<TItemFields>,
    ): Promise<GitHubProjectItem<TItemFields> | undefined>;
    archive(
      itemNodeId: string,
    ): Promise<GitHubProjectItem<TItemFields> | undefined>;
    archiveByContentId(
      contentNodeId: string,
    ): Promise<GitHubProjectItem<TItemFields> | undefined>;
    archiveByContentRepositoryAndNumber(
      repositoryName: string,
      issueOrPullRequestNumber: number,
    ): Promise<GitHubProjectItem<TItemFields> | undefined>;
    remove(
      itemNodeId: string,
    ): Promise<GitHubProjectItem<TItemFields> | undefined>;
    removeByContentId(
      contentNodeId: string,
    ): Promise<GitHubProjectItem<TItemFields> | undefined>;
    removeByContentRepositoryAndNumber(
      repositoryName: string,
      issueOrPullRequestNumber: number,
    ): Promise<GitHubProjectItem<TItemFields> | undefined>;
  };
}

export type MatchFieldNameFn = (
  projectFieldName: string,
  userFieldName: string,
) => boolean;
export type MatchFieldOptionValueFn = (
  fieldOptionValue: string,
  userValue: string,
) => boolean;

export type GitHubProjectOptions<
  TFields extends Record<string, FieldOptions> = {},
> =
  | {
      owner: string;
      number: number;
      token: string;
      fields?: TFields;
      matchFieldName?: MatchFieldNameFn;
      matchFieldOptionValue?: MatchFieldOptionValueFn;
    }
  | {
      owner: string;
      number: number;
      octokit: Octokit;
      fields?: TFields;
      matchFieldName?: MatchFieldNameFn;
      matchFieldOptionValue?: MatchFieldOptionValueFn;
    };

export type GitHubProjectItem<
  TFields extends {} = Record<keyof BUILT_IN_FIELDS, string | null>,
> =
  | ProjectItem_Redacted<TFields>
  | ProjectItem_DraftIssue<TFields>
  | ProjectItem_PullRequest<TFields>
  | ProjectItem_Issue<TFields>;

type ProjectItem_Redacted<TFields> = {
  type: "REDACTED";
  id: string;
  isArchived: boolean;
  fields: TFields;
  content: {};
};

type ProjectItem_DraftIssue<TFields> = {
  type: "DRAFT_ISSUE";
  id: string;
  isArchived: boolean;
  fields: TFields;
  content: DraftIssueContent;
};

type ProjectItem_Issue<TFields> = {
  type: "ISSUE";
  id: string;
  isArchived: boolean;
  fields: TFields;
  content: IssueContent;
};

type ProjectItem_PullRequest<TFields> = {
  type: "PULL_REQUEST";
  id: string;
  isArchived: boolean;
  fields: TFields;
  content: PullRequestContent;
};

type RedactedContent = {
  type: "REDACTED";
};

type DraftIssueContent = {
  id: string;
  title: string;
  createdAt: string;
  assignees: string[];
};

type IssueContent = {
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
  } | null;
  title: string;
  url: string;
};

type PullRequestContent = IssueContent & {
  merged: boolean;
};

export type ProjectFieldNode = {
  id: string;
  name: string;
  dataType: string;

  /**
   * `options` is only set on `ProjectV2SingleSelectField`
   */
  options?: { id: string; name: string }[];

  /**
   * `configuration` is only set on `ProjectV2IterationField`
   */
  configuration?: {
    iterations: {
      id: string;
      title: string;
      duration: number;
      startDate: string;
    }[];
    completedIterations: {
      id: string;
      title: string;
      duration: number;
      startDate: string;
    }[];
  };
};

export type ProjectField =
  | ProjectFieldWithoutOptions
  | ProjectFieldWithOptions
  | OptionalNonExistingField;
export type ProjectFieldMap = Record<string, ProjectField>;

type ProjectFieldWithoutOptions = {
  dataType: string;
  id: string;
  name: string;
  userName: string;
  optional: boolean;
  existsInProject: true;
};
type ProjectFieldWithOptions = {
  dataType: string;
  id: string;
  name: string;
  userName: string;
  optionsById: Record<string, string>;
  optionsByValue: Record<string, string>;
  optional: boolean;
  existsInProject: true;
};
type OptionalNonExistingField = {
  dataType: string;
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
  | GitHubProjectStateWithFields;

type GitHubProjectStateCommon = {
  matchFieldName: MatchFieldNameFn;
  matchFieldOptionValue: MatchFieldOptionValueFn;
};
type GitHubProjectStateInit = GitHubProjectStateCommon & {
  didLoadFields: false;
};

export type GitHubProjectStateWithFields = GitHubProjectStateCommon & {
  didLoadFields: true;
  id: string;
  title: string;
  url: string;
  fields: ProjectFieldMap;
  databaseId: string;
};

export declare class GitHubProjectError extends Error {
  // This causes an odd error that I don't know how to workaround
  // > Property name in type ... is not assignable to the same property in base type GitHubProjectError.
  // name: "GitHubProjectError";
  details: {};
  toHumanMessage(): string;
}

type GitHubProjectNotFoundErrorDetails = {
  owner: string;
  number: number;
};

export declare class GitHubProjectNotFoundError<
  TDetails extends GitHubProjectNotFoundErrorDetails,
> extends GitHubProjectError {
  name: "GitHubProjectNotFoundError";
  details: TDetails;
  constructor(details: TDetails);
}

type GitHubProjectUnknownFieldErrorDetails = {
  projectFieldNames: string[];
  userFieldName: string;
  userFieldNameAlias: string;
};

export declare class GitHubProjectUnknownFieldError<
  TDetails extends GitHubProjectUnknownFieldErrorDetails,
> extends GitHubProjectError {
  name: "GitHubProjectUnknownFieldError";
  details: TDetails;
  constructor(details: TDetails);
}

type GitHubProjectUnknownFieldOptionErrorDetails = {
  userValue: string;
  field: {
    id: string;
    name: string;
    options: {
      id: string;
      name: string;
    }[];
  };
};

export declare class GitHubProjectUnknownFieldOptionError<
  TDetails extends GitHubProjectUnknownFieldOptionErrorDetails,
> extends GitHubProjectError {
  name: "GitHubProjectUnknownFieldOptionError";
  details: TDetails;
  constructor(details: TDetails);
}

type GitHubProjectUpdateReadOnlyFieldErrorDetails = {
  fields: {
    id: string;
    name: string;
    userName: string;
    userValue: string | null;
  }[];
};

export declare class GitHubProjectUpdateReadOnlyFieldError<
  TDetails extends GitHubProjectUpdateReadOnlyFieldErrorDetails,
> extends GitHubProjectError {
  name: "GitHubProjectUpdateReadOnlyFieldError";
  details: TDetails;
  constructor(details: TDetails);
}
