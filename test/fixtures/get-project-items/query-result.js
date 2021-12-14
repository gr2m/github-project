export const getProjectItemsQueryResultFixture = {
  data: {
    organization: {
      projectNext: {
        id: "PN_kwDOBYMIeM0lfA",
        title: "Changelog",
        description: null,
        url: "https://github.com/orgs/gr2m-issues-automation-sandbox/projects/1",
        fields: {
          nodes: [
            {
              id: "MDE2OlByb2plY3ROZXh0RmllbGQ3MTI5NA==",
              name: "Title",
              settings: "null",
            },
            {
              id: "MDE2OlByb2plY3ROZXh0RmllbGQ3MTI5NQ==",
              name: "Assignees",
              settings: "null",
            },
            {
              id: "MDE2OlByb2plY3ROZXh0RmllbGQ3MTI5Ng==",
              name: "Status",
              settings:
                '{"options":[{"id":"f75ad846","name":"In Progress","name_html":"In Progress"},{"id":"47fc9ee4","name":"Ready","name_html":"Ready"},{"id":"98236657","name":"Done","name_html":"Done"}]}',
            },
            {
              id: "MDE2OlByb2plY3ROZXh0RmllbGQ3MTI5Nw==",
              name: "Labels",
              settings: "null",
            },
            {
              id: "MDE2OlByb2plY3ROZXh0RmllbGQ3MTI5OA==",
              name: "Repository",
              settings: "null",
            },
            {
              id: "MDE2OlByb2plY3ROZXh0RmllbGQ3MTI5OQ==",
              name: "Milestone",
              settings: "null",
            },
            {
              id: "MDE2OlByb2plY3ROZXh0RmllbGQ3MTMyMw==",
              name: "Relevant to users?",
              settings:
                '{"options":[{"id":"c9823470","name":"Yes","name_html":"Yes"},{"id":"3df62e6f","name":"No","name_html":"No"}]}',
            },
            {
              id: "MDE2OlByb2plY3ROZXh0RmllbGQ3MTMyNA==",
              name: "Suggested Changelog",
              settings: '{"width":200}',
            },
            {
              id: "MDE2OlByb2plY3ROZXh0RmllbGQ0MTUwMjk=",
              name: "Linked Pull Requests",
              settings: "null",
            },
          ],
        },
        items: {
          nodes: [
            {
              id: "PNI_lADOBYMIeM0lfM4AAzDD",
              title: "Manual entry",
              content: null,
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
              content: {
                __typename: "PullRequest",
                id: "PR_kwDOGNkQys4tKgLV",
                number: 1,
                title: "Update README.md",
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
                  nameWithOwner:
                    "gr2m-issues-automation-sandbox/example-product",
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
              content: {
                __typename: "Issue",
                id: "I_kwDOGNkQys49IizC",
                number: 2,
                title: "Enforce setting project via github actions",
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
                  nameWithOwner:
                    "gr2m-issues-automation-sandbox/example-product",
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
