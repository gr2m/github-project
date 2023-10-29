// @ts-check

const queryIssuesAndPullRequestNodes = `
  id
  databaseId
  number
  title
  url
  createdAt
  author {
    login
  }
  assignees(first: 10) {
    nodes {
      login
    }
  }
  labels(first: 10) {
    nodes {
      name
    }
  }
  closed
  closedAt
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
  url
  databaseId
  fields(first: 50) {
    nodes {
      ... on ProjectV2FieldCommon {
        id
        dataType
        name
      }
      ... on ProjectV2SingleSelectField {
        options {
          id
          name
        }
      }
      ... on ProjectV2IterationField {
        configuration {
          iterations {
            id
            title
            duration
            startDate
          }
          completedIterations {
            id
            title
            duration
            startDate
          }
          duration
          startDay
        }
      }
    }
  }
`;

const queryContentNode = `
  content {
    ... on DraftIssue {
      id
      title
      createdAt
      updatedAt
      author: creator {
        login
      }
      assignees(first: 10) {
        nodes {
          login
        }
      }
    }
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
  createdAt
  type
  isArchived
  ${queryContentNode}
  fieldValues(first: 20) {
    nodes {
      __typename
      ... on ProjectV2ItemFieldDateValue {
        date
        field {
          ... on ProjectV2Field {
            id
          }
        }
      }
      ... on ProjectV2ItemFieldIterationValue {
        title
        iterationId
        startDate
        duration
        field {
          ... on ProjectV2IterationField {
            id
          }
        }
      }
      ... on ProjectV2ItemFieldNumberValue {
        number
        field {
          ... on ProjectV2Field {
            id
          }
        }
      }
      ... on ProjectV2ItemFieldSingleSelectValue {
        optionId
        field {
          ... on ProjectV2SingleSelectField {
            id
          }
        }
      }
      ... on ProjectV2ItemFieldTextValue {
        text
        field {
          ... on ProjectV2Field {
            id
          }
        }
      }
    }
  }
`;

export const getProjectWithItemsQuery = `
  query getProjectWithItems($owner: String!, $number: Int!) {
    userOrOrganization: repositoryOwner(login: $owner) {
      ... on ProjectV2Owner {
        projectV2(number: $number) {
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
  }
`;

export const getProjectItemsPaginatedQuery = `
  query getPaginatedProjectItems($owner: String!, $number: Int!, $first: Int, $after: String) {
    userOrOrganization: repositoryOwner(login: $owner) {
      ... on ProjectV2Owner {
        projectV2(number: $number) {
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
  }
`;

export const getProjectCoreDataQuery = `
  query getProjectCoreData($owner: String!, $number: Int!) {
    userOrOrganization: repositoryOwner(login: $owner) {
      ... on ProjectV2Owner {
        projectV2(number: $number) {
          ${queryProjectNodes}
        }
      }
    }
  }
`;

export const getItemQuery = `
  query getProjectItem($id:ID!) {
    node(id:$id){
      ... on ProjectV2Item {
        ${queryItemFieldNodes}
      }
    }
  }
`;

const onIssueOrPullRequestFragments = `
  ... on Issue {
    title
    url
    projectItems(first: 10) {
      nodes {
        project {
          number
        }
        ${queryItemFieldNodes}
      }
    }
  }
  ... on PullRequest {
    title
    url
    projectItems(first: 10) {
      nodes {
        project {
          number
        }
        ${queryItemFieldNodes}
      }
    }
  }
`;

export const getItemByContentIdQuery = `
  query getProjectItemByContentId($id: ID!) {
    node(id: $id) {
      ${onIssueOrPullRequestFragments}
    }
  }
`;

export const getItemByContentRepositoryAndNameQuery = `
  query getProjectItemByContentRepositoryAndNumber($owner: String!, $repositoryName: String!, $number: Int!) {
    repositoryOwner(login: $owner) {
      repository(name: $repositoryName) {
        issueOrPullRequest(number: $number) {
          ${onIssueOrPullRequestFragments}
        }
      }
    }
  }
`;

export const addDraftIssueToProjectMutation = `
  mutation addProjectV2DraftIssue($projectId: ID!, $title: String!, $body: String, $assigneeIds: [ID!]) {
    addProjectV2DraftIssue(input: {projectId: $projectId, title: $title, body: $body, assigneeIds: $assigneeIds}) {
      projectItem {
        ${queryItemFieldNodes}
      }
    }
  }
`;

export const addIssueToProjectMutation = `
  mutation addIssueToProject($projectId:ID!, $contentId:ID!) {
    addProjectV2ItemById(input:{
      projectId:$projectId,
      contentId:$contentId
    }) {
      item {
        ${queryItemFieldNodes}
      }
    }
  }
`;

export const removeItemFromProjectMutation = `
  mutation removeItemFromProject($projectId:ID!, $itemId:ID!) {
    deleteProjectV2Item(input:{
      projectId:$projectId,
      itemId:$itemId
    }) {
      clientMutationId
    }
  }
`;

export const archiveItemMutation = `
  mutation archiveItem($projectId: ID!, $itemId: ID!) {
    archiveProjectV2Item(input:{projectId: $projectId, itemId: $itemId }) {
      clientMutationId
    }
  }
`;
