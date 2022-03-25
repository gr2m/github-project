export const listItemsFixture = [
  {
    id: "PNI_lADOBYMIeM0lfM4AAzDD",
    type: "DRAFT_ISSUE",
    fields: {
      title: "Manual entry",
      status: null,
      relevantToUsers: "Yes",
      suggestedChangelog: null,
    },
  },
  {
    id: "PNI_lADOBYMIeM0lfM4AAzDx",
    type: "PULL_REQUEST",
    fields: {
      title: "Update README.md",
      status: "In Progress",
      relevantToUsers: null,
      suggestedChangelog: null,
    },
    content: {
      isIssue: false,
      isPullRequest: true,
      id: "PR_kwDOGNkQys4tKgLV",
      number: 1,
      createdAt: "2021-10-13T19:58:16Z",
      title: "Update README.md",
      url: "https://github.com/gr2m-issues-automation-sandbox/example-product/pulls/1",
      closed: false,
      closedAt: null,
      assignees: [],
      labels: [],
      repository: "example-product",
      milestone: null,
      merged: false,
    },
  },
  {
    id: "PNI_lADOBYMIeM0lfM4ADfm9",
    type: "ISSUE",
    fields: {
      title: "Enforce setting project via github actions",
      status: null,
      relevantToUsers: null,
      suggestedChangelog: null,
    },
    content: {
      isIssue: true,
      isPullRequest: false,
      id: "I_kwDOGNkQys49IizC",
      number: 2,
      createdAt: "2021-10-13T20:07:02Z",
      title: "Enforce setting project via github actions",
      url: "https://github.com/gr2m-issues-automation-sandbox/example-product/issues/2",
      closed: false,
      closedAt: null,
      assignees: [],
      labels: [],
      repository: "example-product",
      milestone: null,
    },
  },
];
