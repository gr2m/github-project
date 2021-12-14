const queryIssuesAndPullRequestNodes = `
                id
                number
                title
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
                  nameWithOwner
                }
`;

export const getProjectWithItemsQuery = `
  query getProjectWithItems($org: String!,$number: Int!) {
    organization(login: $org) {
      projectNext(number: $number) {
        id
        title
        description
        url
        fields(first: 20) {
          nodes {
            id
            name
            settings
          }
        }
        items(first: 100) {
          nodes {
            id
            title
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
            fieldValues(first: 20) {
              nodes {
                value
                projectField {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const getProjectCoreDataQuery = `
  query getProjectCoreData($org: String!,$number: Int!) {
    organization(login: $org) {
      projectNext(number: $number) {
        id
        description
        url
        fields(first: 20) {
          nodes {
            id
            name
            settings
          }
        }
      }
    }
  }
`;

export const addIssueToProjectMutation = `
mutation addIssueToProject($projectId:ID!,$contentId:ID!) {
  addProjectNextItem(input:{
    projectId:$projectId,
    contentId:$contentId
  }) {
    projectNextItem {
      id
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
      fieldValues(first: 20) {
        nodes {
          value
          projectField {
            id
          }
        }
      }
    }
  }
}
`;
