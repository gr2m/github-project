export const getProjectItemsQueryResultFixture = {
  data: {
    organization: {
      projectNext: {
        items: {
          pageInfo: {
            hasNextPage: false,
            endCursor: 'PNI_lADOBYMIeM0lfM4ADfm9'
          },
          nodes: [
            {
              id: "PNI_lADOBYMIeM0lfM4AAzDD",
              title: "Manual entry",
              type: "DRAFT_ISSUE",
              fieldValues: {
                nodes: [
                  {
                    value: "Manual entry",
                    projectField: {
                      id: "MDE2OlByb2plY3ROZXh0RmllbGQ3MTI5NA==",
                    },
                  },
                  {
                    value: "c9823470",
                    projectField: {
                      id: "MDE2OlByb2plY3ROZXh0RmllbGQ3MTMyMw==",
                    },
                  },
                ],
              },
            },
            {
              id: "PNI_lADOBYMIeM0lfM4AAzDx",
              title: "Update README.md",
              type: "PULL_REQUEST",
              content: {
                __typename: "PullRequest",
                id: "PR_kwDOGNkQys4tKgLV",
                number: 1,
                title: "Update README.md",
                url: "https://github.com/gr2m-issues-automation-sandbox/example-product/pulls/1",
                createdAt: "2021-10-13T19:58:16Z",
                databaseId: 757727957,
                assignees: {
                  nodes: [],
                },
                labels: {
                  nodes: [],
                },
                closed: false,
                closedAt: null,
                milestone: null,
                repository: {
                  name: "example-product",
                },
                merged: false,
              },
              fieldValues: {
                nodes: [
                  {
                    value: "Update README.md",
                    projectField: {
                      id: "MDE2OlByb2plY3ROZXh0RmllbGQ3MTI5NA==",
                    },
                  },
                  {
                    value: "f75ad846",
                    projectField: {
                      id: "MDE2OlByb2plY3ROZXh0RmllbGQ3MTI5Ng==",
                    },
                  },
                ],
              },
            },
            {
              id: "PNI_lADOBYMIeM0lfM4ADfm9",
              title: "Enforce setting project via github actions",
              type: "ISSUE",
              content: {
                __typename: "Issue",
                id: "I_kwDOGNkQys49IizC",
                number: 2,
                title: "Enforce setting project via github actions",
                url: "https://github.com/gr2m-issues-automation-sandbox/example-product/issues/2",
                createdAt: "2021-10-13T20:07:02Z",
                databaseId: 1025649858,
                assignees: {
                  nodes: [],
                },
                labels: {
                  nodes: [],
                },
                closed: false,
                closedAt: null,
                milestone: null,
                repository: {
                  name: "example-product",
                },
              },
              fieldValues: {
                nodes: [
                  {
                    value: "Enforce setting project via github actions",
                    projectField: {
                      id: "MDE2OlByb2plY3ROZXh0RmllbGQ3MTI5NA==",
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    },
  },
};
