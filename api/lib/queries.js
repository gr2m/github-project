// @ts-check

const queryIssuesAndPullRequestNodes = `
  id
  number
  title
  url
  createdAt
  databaseId
  assignees(first:10) {
    nodes {
      login
    }
  }
  labels(first:10){
    nodes {
      name
    }
  }
  closed
  closedAt
  createdAt
  milestone {
    number
    title
    state
  }
  repository {
    name
  }
`;

const queryProjectNodes = `
  id
  title
  description
  url
  fields(first: 50) {
    nodes {
      id
      name
      settings
    }
  }
`;

const queryContentNode = `
  content {
    __typename
    ... on Issue {
      ${queryIssuesAndPullRequestNodes}
    }
    ... on PullRequest {
      ${queryIssuesAndPullRequestNodes}
      merged
    }
  }
`;
export const queryItemFieldNodes = `
  id
  type
  ${queryContentNode}
  fieldValues(first: 20) {
    nodes {
      value
      projectField {
        id
      }
    }
  }
`;

export const getProjectWithItems = `
  query getProjectWithItems($org: String!, $number: Int!) {
    organization(login: $org) {
      projectNext(number: $number) {
        ${queryProjectNodes}
        items(first: 100) {
          pageInfo {
            endCursor
            hasNextPage
          }
          nodes {
            ${queryItemFieldNodes}
          }
        }
      }
    }
  }
`

export const getProjectItemsPaginatedQuery = `
  query getProjectItems($org: String!, $number: Int!, $first: Int, $after: String) {
    organization(login: $org) {
      projectNext(number: $number) {
        items(first: $first, after: $after) {
          pageInfo {
            endCursor
            hasNextPage
          }
          nodes {
            ${queryItemFieldNodes}
          }
        }
      }
    }
  }
`;

export const getProjectCoreDataQuery = `
  query getProjectCoreData($org: String!, $number: Int!) {
    organization(login: $org) {
      projectNext(number: $number) {
        ${queryProjectNodes}
      }
    }
  }
`;

export const addIssueToProjectMutation = `
  mutation addIssueToProject($projectId:ID!, $contentId:ID!) {
    addProjectNextItem(input:{
      projectId:$projectId,
      contentId:$contentId
    }) {
      projectNextItem {
        ${queryItemFieldNodes}
      }
    }
  }
`;

export const removeItemFromProjectMutation = `
  mutation deleteProjectNextItem($projectId:ID!, $itemId:ID!) {
    deleteProjectNextItem(input:{
      projectId:$projectId,
      itemId:$itemId
    }) {
      clientMutationId
    }
  }
`;
