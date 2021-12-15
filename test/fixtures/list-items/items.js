export const listItemsFixture = [
  {
    id: "PNI_lADOBYMIeM0lfM4AAzDD",
    fields: {
      title: "Manual entry",
      status: null,
      relevantToUsers: "Yes",
      suggestedChangelog: null,
    },
    isDraft: true,
  },
  {
    id: "PNI_lADOBYMIeM0lfM4AAzDx",
    fields: {
      title: "Update README.md",
      status: "In Progress",
      relevantToUsers: null,
      suggestedChangelog: null,
    },
    isDraft: false,
    issueOrPullRequest: {
      isIssue: false,
      isPullRequest: true,
      id: "PR_kwDOGNkQys4tKgLV",
      number: 1,
      createdAt: "2021-10-13T19:58:16Z",
      closed: false,
      closedAt: null,
      assignees: [],
      labels: [],
      repository: "gr2m-issues-automation-sandbox/example-product",
      milestone: null,
      merged: false,
    },
  },
  {
    id: "PNI_lADOBYMIeM0lfM4ADfm9",
    fields: {
      title: "Enforce setting project via github actions",
      status: null,
      relevantToUsers: null,
      suggestedChangelog: null,
    },
    isDraft: false,
    issueOrPullRequest: {
      isIssue: true,
      isPullRequest: false,
      id: "I_kwDOGNkQys49IizC",
      number: 2,
      createdAt: "2021-10-13T20:07:02Z",
      closed: false,
      closedAt: null,
      assignees: [],
      labels: [],
      repository: "gr2m-issues-automation-sandbox/example-product",
      milestone: null,
    },
  },
];
