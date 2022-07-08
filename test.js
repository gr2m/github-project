import test from "ava";
import { Octokit } from "@octokit/core";
import prettier from "prettier";

import GitHubProject from "./index.js";

test("getters", (t) => {
  const project = new GitHubProject({
    org: "org",
    number: 1,
    token: "ghp_secret123",
  });

  t.throws(
    () => {
      project.org = "org2";
    },
    undefined,
    "Cannot set read-only property 'org'"
  );
  t.throws(
    () => {
      project.number = 2;
    },
    undefined,
    "Cannot set read-only property 'number'"
  );
  t.throws(
    () => {
      project.octokit = new Octokit();
    },
    undefined,
    "Cannot set read-only property 'octokit'"
  );
  t.throws(
    () => {
      project.fields = {};
    },
    undefined,
    "Cannot set read-only property 'fields'"
  );
});

test("project.items.list()", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );
  const { listItemsFixture } = await import(
    "./test/fixtures/list-items/items.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    return {
      data: getProjectItemsQueryResultFixture,
    };
  });
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  const items = await project.items.list();

  t.deepEqual(items, listItemsFixture);
});

test("project.items.list() without configuring custom fields", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    return {
      data: getProjectItemsQueryResultFixture,
    };
  });
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {},
  });

  const result = await project.items.list();

  // does not return custom fields
  t.deepEqual(result, [
    {
      id: "PNI_lADOBYMIeM0lfM4AAzDD",
      fields: { title: "Manual entry", status: null },
      type: "DRAFT_ISSUE",
    },
    {
      id: "PNI_lADOBYMIeM0lfM4AAzDx",
      type: "PULL_REQUEST",
      fields: { title: "Update README.md", status: "In Progress" },
      content: {
        isIssue: false,
        isPullRequest: true,
        id: "PR_kwDOGNkQys4tKgLV",
        title: "Update README.md",
        url: "https://github.com/gr2m-issues-automation-sandbox/example-product/pulls/1",
        number: 1,
        createdAt: "2021-10-13T19:58:16Z",
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
      },
      content: {
        isIssue: true,
        isPullRequest: false,
        id: "I_kwDOGNkQys49IizC",
        number: 2,
        title: "Enforce setting project via github actions",
        url: "https://github.com/gr2m-issues-automation-sandbox/example-product/issues/2",
        createdAt: "2021-10-13T20:07:02Z",
        closed: false,
        closedAt: null,
        assignees: [],
        labels: [],
        repository: "example-product",
        milestone: null,
      },
    },
  ]);
});

test("project.items.list() multiple calls only send query once", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );

  const octokit = new Octokit();
  let queryCounter = 0;
  octokit.hook.wrap("request", async (request, options) => {
    queryCounter++;
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    return {
      data: getProjectItemsQueryResultFixture,
    };
  });
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  await project.items.list();
  await project.items.list();

  t.deepEqual(queryCounter, 1);
});

test("project.items.list() with field using different capitalization", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );
  const { listItemsFixture } = await import(
    "./test/fixtures/list-items/items.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    return {
      data: getProjectItemsQueryResultFixture,
    };
  });
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "RELEVANT TO USERS?",
      suggestedChangelog: "suggested changelog",
    },
  });

  const items = await project.items.list();

  t.deepEqual(items, listItemsFixture);
});

test("project.items.list() with pagination", async (t) => {
  const { listItemsFixture } = await import(
    "./test/fixtures/list-items/items.js"
  );
  const { getProjectItemsPage1QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-1.js"
  );
  const { getProjectItemsPage2QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-2.js"
  );
  const { getProjectItemsPage3QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-3.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      return {
        data: getProjectItemsPage1QueryResultFixture,
      };
    }

    if (/query getProjectItems\(/.test(options.query)) {
      if (options.variables.after === "PNI_lADOBYMIeM0lfM4AAzDD") {
        return {
          data: getProjectItemsPage2QueryResultFixture,
        };
      }

      return {
        data: getProjectItemsPage3QueryResultFixture,
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "RELEVANT TO USERS?",
      suggestedChangelog: "suggested changelog",
    },
  });

  const items = await project.items.list();

  t.deepEqual(items, listItemsFixture);
});

test("project.items.add() issue", async (t) => {
  const { getProjectFieldsQueryResultFixture } = await import(
    "./test/fixtures/get-project-fields/query-result.js"
  );
  const { addIssueItemQueryResultFixture } = await import(
    "./test/fixtures/add-item/issue/query-result.js"
  );
  const { newIssueItemFixture } = await import(
    "./test/fixtures/add-item/issue/new-issue-item.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectCoreData\(/.test(options.query)) {
      return {
        data: getProjectFieldsQueryResultFixture,
      };
    }

    if (/mutation addIssueToProject\(/.test(options.query)) {
      return {
        data: addIssueItemQueryResultFixture,
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  const newItem = await project.items.add("issue node_id");
  t.deepEqual(newItem, newIssueItemFixture);
});

test("project.items.add() issue with custom fields", async (t) => {
  const { getProjectFieldsQueryResultFixture } = await import(
    "./test/fixtures/get-project-fields/query-result.js"
  );
  const { addIssueItemQueryResultFixture } = await import(
    "./test/fixtures/add-item/issue/query-result.js"
  );
  const { newIssueItemFixture } = await import(
    "./test/fixtures/add-item/issue/new-issue-item.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectCoreData\(/.test(options.query)) {
      return {
        data: getProjectFieldsQueryResultFixture,
      };
    }

    if (/mutation addIssueToProject\(/.test(options.query)) {
      return {
        data: addIssueItemQueryResultFixture,
      };
    }

    if (/mutation setItemProperties\(/.test(options.query)) {
      return { data: {} };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  const newItem = await project.items.add("issue node_id", { status: "Done" });
  t.deepEqual(newItem, {
    ...newIssueItemFixture,
    fields: {
      ...newIssueItemFixture.fields,
      status: "Done",
    },
  });
});

test("project.items.add() pull request", async (t) => {
  const { getProjectFieldsQueryResultFixture } = await import(
    "./test/fixtures/get-project-fields/query-result.js"
  );
  const { addPullRequestItemQueryResultFixture } = await import(
    "./test/fixtures/add-item/pull-request/query-result.js"
  );
  const { newPullRequestItemFixture } = await import(
    "./test/fixtures/add-item/pull-request/new-pull-request-item.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectCoreData\(/.test(options.query)) {
      return {
        data: getProjectFieldsQueryResultFixture,
      };
    }

    if (/mutation addIssueToProject\(/.test(options.query)) {
      return {
        data: addPullRequestItemQueryResultFixture,
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  const newItem = await project.items.add("issue node_id");
  t.deepEqual(newItem, newPullRequestItemFixture);
});

test("project.items.add() without configuring custom fields", async (t) => {
  const { getProjectFieldsQueryResultFixture } = await import(
    "./test/fixtures/get-project-fields/query-result.js"
  );
  const { addIssueItemQueryResultFixture } = await import(
    "./test/fixtures/add-item/issue/query-result.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectCoreData\(/.test(options.query)) {
      return {
        data: getProjectFieldsQueryResultFixture,
      };
    }

    if (/mutation addIssueToProject\(/.test(options.query)) {
      return {
        data: addIssueItemQueryResultFixture,
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {},
  });

  const item = await project.items.add("issue node_id");

  // does not include custom fields
  t.deepEqual(item, {
    id: "PNI_lADOBYMIeM0lfM4ADfm9",
    type: "ISSUE",
    fields: {
      title: "Enforce setting project via github actions",
      status: null,
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
  });
});

test("project.items.add() multiple calls sends query to load fields only once", async (t) => {
  const { getProjectFieldsQueryResultFixture } = await import(
    "./test/fixtures/get-project-fields/query-result.js"
  );
  const { addIssueItemQueryResultFixture } = await import(
    "./test/fixtures/add-item/issue/query-result.js"
  );

  let queryCounter = 0;

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectCoreData\(/.test(options.query)) {
      queryCounter++;
      return {
        data: getProjectFieldsQueryResultFixture,
      };
    }

    if (/mutation addIssueToProject\(/.test(options.query)) {
      return {
        data: addIssueItemQueryResultFixture,
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  await project.items.add("issue node_id");
  await project.items.add("issue node_id");
  t.deepEqual(queryCounter, 1);
});

test("project.items.add() after project.items.list() does not send getProjectCoreData query", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );
  const { addIssueItemQueryResultFixture } = await import(
    "./test/fixtures/add-item/issue/query-result.js"
  );

  const octokit = new Octokit();
  let queryCounter = 0;
  octokit.hook.wrap("request", async (request, options) => {
    queryCounter++;

    if (/query getProjectWithItems\(/.test(options.query)) {
      return {
        data: getProjectItemsQueryResultFixture,
      };
    }

    if (/mutation addIssueToProject\(/.test(options.query)) {
      return {
        data: addIssueItemQueryResultFixture,
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  await project.items.list();
  await project.items.add("issue node_id");
  t.deepEqual(queryCounter, 2);
});

test("project.items.add() adding existing item after project.items.list() does not send query to add item again", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );

  const octokit = new Octokit();
  let queryCounter = 0;
  octokit.hook.wrap("request", async (request, options) => {
    queryCounter++;

    t.regex(options.query, /query getProjectWithItems\(/);

    return {
      data: getProjectItemsQueryResultFixture,
    };
  });
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  await project.items.list();
  await project.items.add("PR_kwDOGNkQys4tKgLV");
  t.deepEqual(queryCounter, 1);
});

test("project.items.add() adding existing item with fields after project.items.list() does not send query to add item again", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );

  const octokit = new Octokit();
  let queryCounter = 0;
  octokit.hook.wrap("request", async (request, options) => {
    queryCounter++;

    if (/query getProjectWithItems\(/.test(options.query)) {
      return {
        data: getProjectItemsQueryResultFixture,
      };
    }

    if (/mutation setItemProperties\(/.test(options.query)) {
      return { data: {} };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  await project.items.list();
  const projectItem = await project.items.add("PR_kwDOGNkQys4tKgLV", {
    status: "Done",
  });
  t.deepEqual(projectItem.fields.status, "Done");
  t.deepEqual(queryCounter, 2);
});

test('project.items.add() with " in value', async (t) => {
  const { getProjectFieldsQueryResultFixture } = await import(
    "./test/fixtures/get-project-fields/query-result.js"
  );
  const { addIssueItemQueryResultFixture } = await import(
    "./test/fixtures/add-item/issue/query-result.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    if (/query getProjectCoreData\(/.test(options.query)) {
      return {
        data: getProjectFieldsQueryResultFixture,
      };
    }

    if (/mutation addIssueToProject\(/.test(options.query)) {
      return { data: addIssueItemQueryResultFixture };
    }

    if (/mutation setItemProperties\(/.test(options.query)) {
      t.regex(options.query, /value: "Is \\"it\\"?"/);

      return { data: {} };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      title: "Title",
    },
  });

  await project.items.add("PR_kwDOGNkQys4tKgLV", {
    title: 'Is "it"?',
  });
});

test("project.items.add() with optional, non-existing fields", async (t) => {
  const { getProjectFieldsQueryResultFixture } = await import(
    "./test/fixtures/get-project-fields/query-result.js"
  );
  const { addIssueItemQueryResultFixture } = await import(
    "./test/fixtures/add-item/issue/query-result.js"
  );
  const { newIssueItemFixture } = await import(
    "./test/fixtures/add-item/issue/new-issue-item.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectCoreData\(/.test(options.query)) {
      return {
        data: getProjectFieldsQueryResultFixture,
      };
    }

    if (/mutation addIssueToProject\(/.test(options.query)) {
      return {
        data: addIssueItemQueryResultFixture,
      };
    }

    if (/mutation setItemProperties\(/.test(options.query)) {
      t.is(
        options.query.includes("optionalField: updateProjectNextItemField"),
        false,
        "mutation query does not set non-existing field"
      );

      return { data: {} };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      optionalField: {
        name: "Optional Field",
        optional: true,
      },
    },
  });

  const newItem = await project.items.add("issue node_id", {
    optionalField: "nope",
  });

  t.deepEqual(newItem, {
    ...newIssueItemFixture,
    fields: {
      title: "Enforce setting project via github actions",
      status: null,
    },
  });
});

test("project.items.get(itemId)", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );
  const { draftItemFixture } = await import(
    "./test/fixtures/get-item/draft-item.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");
    t.deepEqual(options.variables, {
      org: "org",
      number: 1,
    });

    return {
      data: getProjectItemsQueryResultFixture,
    };
  });
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  const item = await project.items.get("PNI_lADOBYMIeM0lfM4AAzDD");

  t.deepEqual(item, draftItemFixture);
});

test("project.items.get() not found", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");
    t.deepEqual(options.variables, {
      org: "org",
      number: 1,
    });

    return {
      data: getProjectItemsQueryResultFixture,
    };
  });
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  const item = await project.items.get("<unknown node id>");

  t.deepEqual(item, undefined);
});

test("project.items.get(contentId)", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );
  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");
    t.deepEqual(options.variables, {
      org: "org",
      number: 1,
    });

    return {
      data: getProjectItemsQueryResultFixture,
    };
  });
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  const item = await project.items.get("I_kwDOGNkQys49IizC");
  t.deepEqual(item, undefined);
});

test("project.items.getByContentId(contentId)", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );
  const { issueItemFixture } = await import(
    "./test/fixtures/get-item/issue-item.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");
    t.deepEqual(options.variables, {
      org: "org",
      number: 1,
    });

    return {
      data: getProjectItemsQueryResultFixture,
    };
  });
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
      "Ready For Work": "Ready For Work",
    },
  });

  const item = await project.items.getByContentId("I_kwDOGNkQys49IizC");
  t.deepEqual(item, issueItemFixture);
});

test("project.items.getByContentRepositoryAndNumber(repositoryName, issueOrPullRequestNumber)", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );
  const { issueItemFixture } = await import(
    "./test/fixtures/get-item/issue-item.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");
    t.deepEqual(options.variables, {
      org: "org",
      number: 1,
    });

    return {
      data: getProjectItemsQueryResultFixture,
    };
  });
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
      "Ready For Work": "Ready For Work",
    },
  });

  const item = await project.items.getByContentRepositoryAndNumber(
    "example-product",
    2
  );
  t.deepEqual(item, issueItemFixture);
});

test("project.items.update(itemNodeId, fields) unsetting a field (#10)", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    if (/query getProjectWithItems\(/.test(options.query)) {
      return {
        data: getProjectItemsQueryResultFixture,
      };
    }

    if (/mutation setItemProperties\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "PNI_lADOBYMIeM0lfM4ADfm9",
      });
      t.regex(
        options.query,
        /fieldId: "MDE2OlByb2plY3ROZXh0RmllbGQ3MTMyMw==", value: ""/
      );

      return {
        data: {},
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  await project.items.update("PNI_lADOBYMIeM0lfM4ADfm9", {
    relevantToUsers: null,
  });
});

test("project.items.update(itemNodeId, fields)", async (t) => {
  const { getProjectItemsPage1QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-1.js"
  );
  const { getProjectItemsPage2QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-2.js"
  );
  const { getProjectItemsPage3QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-3.js"
  );

  const { issueItemFixture } = await import(
    "./test/fixtures/get-item/issue-item.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      return {
        data: getProjectItemsPage1QueryResultFixture,
      };
    }

    if (/query getProjectItems\(/.test(options.query)) {
      if (options.variables.after === "PNI_lADOBYMIeM0lfM4AAzDD") {
        return {
          data: getProjectItemsPage2QueryResultFixture,
        };
      }

      return {
        data: getProjectItemsPage3QueryResultFixture,
      };
    }

    if (/mutation setItemProperties\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "PNI_lADOBYMIeM0lfM4ADfm9",
      });
      t.regex(options.query, /relevantToUsers: updateProjectNextItemField\(/);

      return {
        data: {},
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
      "Ready For Work": "Ready For Work",
    },
  });

  const updatedItem = await project.items.update("PNI_lADOBYMIeM0lfM4ADfm9", {
    relevantToUsers: "Yes",
    suggestedChangelog: "this and that",
    // properties not set to a string or `null` are ignored
    status: undefined,
  });

  t.deepEqual(updatedItem, {
    ...issueItemFixture,
    fields: {
      ...issueItemFixture.fields,
      relevantToUsers: "Yes",
      suggestedChangelog: "this and that",
    },
  });
});

test("project.items.list() then project.items.update(itemNodeId, fields)", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );
  const { issueItemFixture } = await import(
    "./test/fixtures/get-item/issue-item.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        org: "org",
        number: 1,
      });

      return {
        data: getProjectItemsQueryResultFixture,
      };
    }

    if (/mutation setItemProperties\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "PNI_lADOBYMIeM0lfM4ADfm9",
      });
      t.regex(options.query, /relevantToUsers: updateProjectNextItemField\(/);

      return { data: {} };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
      "Ready For Work": "Ready For Work",
    },
  });

  await project.items.list();

  const updatedItem = await project.items.update("PNI_lADOBYMIeM0lfM4ADfm9", {
    relevantToUsers: "Yes",
    suggestedChangelog: "this and that",
    // properties not set to a string or `null` are ignored
    status: undefined,
  });

  t.deepEqual(updatedItem, {
    ...issueItemFixture,
    fields: {
      ...issueItemFixture.fields,
      relevantToUsers: "Yes",
      suggestedChangelog: "this and that",
    },
  });
});

test("project.items.update(itemNodeId, fields) not found", async (t) => {
  const { getProjectItemsPage1QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-1.js"
  );
  const { getProjectItemsPage2QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-2.js"
  );
  const { getProjectItemsPage3QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-3.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      return {
        data: getProjectItemsPage1QueryResultFixture,
      };
    }

    if (/query getProjectItems\(/.test(options.query)) {
      if (options.variables.after === "PNI_lADOBYMIeM0lfM4AAzDD") {
        return {
          data: getProjectItemsPage2QueryResultFixture,
        };
      }

      return {
        data: getProjectItemsPage3QueryResultFixture,
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  const updatedItem = await project.items.update("<unknown id>", {
    relevantToUsers: "Yes",
  });

  t.deepEqual(updatedItem, undefined);
});

test("project.items.update(itemNodeId, fields) unforeseen GraphQL error", async (t) => {
  const { getProjectItemsPage1QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-1.js"
  );
  const { getProjectItemsPage2QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-2.js"
  );
  const { getProjectItemsPage3QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-3.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      return {
        data: getProjectItemsPage1QueryResultFixture,
      };
    }

    if (/query getProjectItems\(/.test(options.query)) {
      if (options.variables.after === "PNI_lADOBYMIeM0lfM4AAzDD") {
        return {
          data: getProjectItemsPage2QueryResultFixture,
        };
      }

      return {
        data: getProjectItemsPage3QueryResultFixture,
      };
    }

    if (/mutation setItemProperties\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "PNI_lADOBYMIeM0lfM4ADfm9",
      });
      t.regex(options.query, /relevantToUsers: updateProjectNextItemField\(/);

      return {
        headers: {},
        data: {
          errors: [
            {
              type: "UNFORSEEN_ERROR",
            },
          ],
        },
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  try {
    await project.items.update("PNI_lADOBYMIeM0lfM4ADfm9", {
      relevantToUsers: "Yes",
    });
    t.fail("Should have thrown");
  } catch (error) {
    t.deepEqual(error.name, "GraphqlResponseError");
  }
});

test("project.items.update(itemNodeId, fields) with non GraphQL error", async (t) => {
  const { getProjectItemsPage1QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-1.js"
  );
  const { getProjectItemsPage2QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-2.js"
  );
  const { getProjectItemsPage3QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-3.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      return {
        data: getProjectItemsPage1QueryResultFixture,
      };
    }

    if (/query getProjectItems\(/.test(options.query)) {
      if (options.variables.after === "PNI_lADOBYMIeM0lfM4AAzDD") {
        return {
          data: getProjectItemsPage2QueryResultFixture,
        };
      }

      return {
        data: getProjectItemsPage3QueryResultFixture,
      };
    }

    if (/mutation setItemProperties\(/.test(options.query)) {
      throw new Error("oops");
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  try {
    await project.items.update("PNI_lADOBYMIeM0lfM4ADfm9", {
      relevantToUsers: "Yes",
    });
    t.fail("should have thrown");
  } catch (error) {
    t.deepEqual(error.message, "oops");
  }
});

test("project.items.update(itemNodeId, fields) where fields include a built-in read-only project field", async (t) => {
  const { getProjectItemsPage1QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-1.js"
  );
  const { getProjectItemsPage2QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-2.js"
  );
  const { getProjectItemsPage3QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-3.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      return {
        data: getProjectItemsPage1QueryResultFixture,
      };
    }

    if (/query getProjectItems\(/.test(options.query)) {
      if (options.variables.after === "PNI_lADOBYMIeM0lfM4AAzDD") {
        return {
          data: getProjectItemsPage2QueryResultFixture,
        };
      }

      return {
        data: getProjectItemsPage3QueryResultFixture,
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      assignees: "Assignees",
    },
  });

  try {
    await project.items.update("PNI_lADOBYMIeM0lfM4ADfm9", {
      assignees: "something",
    });
    t.fail("Should have thrown");
  } catch (error) {
    t.deepEqual(
      error.message,
      '[github-project] Cannot update read-only fields: "Assignees" (.assignees)'
    );
  }
});

test("project.items.update(itemNodeId, fields) where a field is unknown", async (t) => {
  const { getProjectItemsPage1QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-1.js"
  );
  const { getProjectItemsPage2QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-2.js"
  );
  const { getProjectItemsPage3QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-3.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      return {
        data: getProjectItemsPage1QueryResultFixture,
      };
    }

    if (/query getProjectItems\(/.test(options.query)) {
      if (options.variables.after === "PNI_lADOBYMIeM0lfM4AAzDD") {
        return {
          data: getProjectItemsPage2QueryResultFixture,
        };
      }

      return {
        data: getProjectItemsPage3QueryResultFixture,
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
      unknown: "What is that?",
    },
  });

  try {
    await project.items.update("PNI_lADOBYMIeM0lfM4ADfm9", {
      relevantToUsers: "yes",
      unknown: "something",
    });
    t.fail("Should have thrown");
  } catch (error) {
    t.deepEqual(
      error.message,
      '[github-project] "What is that?" could not be matched with any of the existing field names: "Title", "Assignees", "Status", "Labels", "Repository", "Milestone", "Relevant to users?", "Suggested Changelog", "Linked Pull Requests", "Ready For Work". If the field should be considered optional, then set it to "unknown: { name: "What is that?", optional: true}'
    );
  }
});

test("project.items.update(itemNodeId, fields) with custom status field", async (t) => {
  const { getProjectItemsPage1QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-1.js"
  );
  const { getProjectItemsPage2QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-2.js"
  );
  const { getProjectItemsPage3QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-3.js"
  );
  const { issueItemFixture } = await import(
    "./test/fixtures/get-item/issue-item.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      return {
        data: getProjectItemsPage1QueryResultFixture,
      };
    }

    if (/query getProjectItems\(/.test(options.query)) {
      if (options.variables.after === "PNI_lADOBYMIeM0lfM4AAzDD") {
        return {
          data: getProjectItemsPage2QueryResultFixture,
        };
      }

      return {
        data: getProjectItemsPage3QueryResultFixture,
      };
    }

    if (/mutation setItemProperties\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "PNI_lADOBYMIeM0lfM4ADfm9",
      });
      t.regex(options.query, /status: updateProjectNextItemField\(/);

      return {
        data: {},
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      status: "Relevant to users?",
    },
  });

  const updatedItem = await project.items.update("PNI_lADOBYMIeM0lfM4ADfm9", {
    status: "Yes",
  });

  t.deepEqual(updatedItem, {
    ...issueItemFixture,
    fields: {
      title: issueItemFixture.fields.title,
      status: "Yes",
    },
  });
});

test("project.items.update(itemNodeId, fields) with invalid field option", async (t) => {
  const { getProjectItemsPage1QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-1.js"
  );
  const { getProjectItemsPage2QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-2.js"
  );
  const { getProjectItemsPage3QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-3.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      return {
        data: getProjectItemsPage1QueryResultFixture,
      };
    }

    if (/query getProjectItems\(/.test(options.query)) {
      if (options.variables.after === "PNI_lADOBYMIeM0lfM4AAzDD") {
        return {
          data: getProjectItemsPage2QueryResultFixture,
        };
      }

      return {
        data: getProjectItemsPage3QueryResultFixture,
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      status: "Relevant to users?",
    },
  });

  try {
    await project.items.update("PNI_lADOBYMIeM0lfM4ADfm9", {
      status: "Unknown option",
    });
    t.fail("Should not resolve");
  } catch (error) {
    t.is(error.code, "E_GITHUB_PROJECT_UNKNOWN_FIELD_OPTION");
    t.deepEqual(error.knownOptions, ["Yes", "No"]);
    t.is(error.userOption, "Unknown option");
    t.is(
      error.message,
      `[github-project] "Unknown option" is an invalid option for "Relevant to users?".

Known options are:
- Yes
- No`
    );
  }
});

test("project.items.update() with optional, non-existing fields", async (t) => {
  const { getProjectItemsPage1QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-1.js"
  );
  const { getProjectItemsPage2QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-2.js"
  );
  const { getProjectItemsPage3QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-3.js"
  );

  const { issueItemFixture } = await import(
    "./test/fixtures/get-item/issue-item.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      return {
        data: getProjectItemsPage1QueryResultFixture,
      };
    }

    if (/query getProjectItems\(/.test(options.query)) {
      if (options.variables.after === "PNI_lADOBYMIeM0lfM4AAzDD") {
        return {
          data: getProjectItemsPage2QueryResultFixture,
        };
      }

      return {
        data: getProjectItemsPage3QueryResultFixture,
      };
    }

    if (/mutation setItemProperties\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "PNI_lADOBYMIeM0lfM4ADfm9",
      });
      t.regex(options.query, /relevantToUsers: updateProjectNextItemField\(/);

      return {
        data: {},
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      unknownField: {
        name: "Unknown Field",
        optional: true,
      },
    },
  });

  const updatedItem = await project.items.update("PNI_lADOBYMIeM0lfM4ADfm9", {
    unknownField: "nope",
  });

  t.deepEqual(updatedItem, {
    ...issueItemFixture,
    fields: {
      title: "Enforce setting project via github actions",
      status: null,
      relevantToUsers: null,
    },
  });
});

test("project.items.updateByContentId(contentNodeId, fields)", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );
  const { issueItemFixture } = await import(
    "./test/fixtures/get-item/issue-item.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        org: "org",
        number: 1,
      });

      return {
        data: getProjectItemsQueryResultFixture,
      };
    }

    if (/mutation setItemProperties\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "PNI_lADOBYMIeM0lfM4ADfm9",
      });
      t.regex(options.query, /relevantToUsers: updateProjectNextItemField\(/);

      return { data: {} };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
      "Ready For Work": "Ready For Work",
    },
  });

  const updatedItem = await project.items.updateByContentId(
    "I_kwDOGNkQys49IizC",
    {
      relevantToUsers: "Yes",
    }
  );

  t.deepEqual(updatedItem, {
    ...issueItemFixture,
    fields: {
      ...issueItemFixture.fields,
      relevantToUsers: "Yes",
    },
  });
});

test("project.items.updateByContentId(contentNodeId, fields) not found", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        org: "org",
        number: 1,
      });

      return {
        data: getProjectItemsQueryResultFixture,
      };
    }

    if (/mutation setItemProperties\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "PNI_lADOBYMIeM0lfM4ADfm9",
      });
      t.regex(options.query, /relevantToUsers: updateProjectNextItemField\(/);

      return { data: {} };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  const updatedItem = await project.items.updateByContentId("<unknown id>", {
    relevantToUsers: "Yes",
  });

  t.deepEqual(updatedItem, undefined);
});

test("project.items.updateByContentId(contentNodeId, fields) with optional, non-existing fields", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );
  const { issueItemFixture } = await import(
    "./test/fixtures/get-item/issue-item.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        org: "org",
        number: 1,
      });

      return {
        data: getProjectItemsQueryResultFixture,
      };
    }

    if (/mutation setItemProperties\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "PNI_lADOBYMIeM0lfM4ADfm9",
      });
      t.regex(options.query, /relevantToUsers: updateProjectNextItemField\(/);

      return { data: {} };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      unknownField: {
        name: "Unknown Field",
        optional: true,
      },
    },
  });

  const updatedItem = await project.items.updateByContentId(
    "I_kwDOGNkQys49IizC",
    {
      unknownField: "nope",
    }
  );

  t.deepEqual(updatedItem, {
    ...issueItemFixture,
    fields: {
      title: "Enforce setting project via github actions",
      status: null,
      relevantToUsers: null,
    },
  });
});

test("project.items.updateByContentRepositoryAndNumber(contentNodeId, fields)", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );
  const { issueItemFixture } = await import(
    "./test/fixtures/get-item/issue-item.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        org: "org",
        number: 1,
      });

      return {
        data: getProjectItemsQueryResultFixture,
      };
    }

    if (/mutation setItemProperties\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "PNI_lADOBYMIeM0lfM4ADfm9",
      });
      t.regex(options.query, /relevantToUsers: updateProjectNextItemField\(/);

      return { data: {} };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
      "Ready For Work": "Ready For Work",
    },
  });

  const updatedItem = await project.items.updateByContentRepositoryAndNumber(
    "example-product",
    2,
    {
      relevantToUsers: "Yes",
    }
  );

  t.deepEqual(updatedItem, {
    ...issueItemFixture,
    fields: {
      ...issueItemFixture.fields,
      relevantToUsers: "Yes",
    },
  });
});

test("project.items.updateByContentRepositoryAndNumber(contentNodeId, fields) not found", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        org: "org",
        number: 1,
      });

      return {
        data: getProjectItemsQueryResultFixture,
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  const updatedItem = await project.items.updateByContentRepositoryAndNumber(
    "example-product",
    -1,
    {
      relevantToUsers: "yes",
    }
  );

  t.deepEqual(updatedItem, undefined);
});

test("project.items.updateByContentRepositoryAndNumber(contentNodeId, fields) with optional, non-existing fields", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );
  const { issueItemFixture } = await import(
    "./test/fixtures/get-item/issue-item.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        org: "org",
        number: 1,
      });

      return {
        data: getProjectItemsQueryResultFixture,
      };
    }

    if (/mutation setItemProperties\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "PNI_lADOBYMIeM0lfM4ADfm9",
      });
      t.regex(options.query, /relevantToUsers: updateProjectNextItemField\(/);

      return { data: {} };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      unknownField: {
        name: "Unknown Field",
        optional: true,
      },
    },
  });

  const updatedItem = await project.items.updateByContentRepositoryAndNumber(
    "example-product",
    2,
    {
      unknownField: "nope",
    }
  );

  t.deepEqual(updatedItem, {
    ...issueItemFixture,
    fields: {
      title: "Enforce setting project via github actions",
      status: null,
      relevantToUsers: null,
    },
  });
});

test("project.items.remove(itemId)", async (t) => {
  const { getProjectFieldsQueryResultFixture } = await import(
    "./test/fixtures/get-project-fields/query-result.js"
  );

  const octokit = new Octokit();

  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectCoreData\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        org: "org",
        number: 1,
      });

      return {
        data: getProjectFieldsQueryResultFixture,
      };
    }
    if (/mutation deleteProjectNextItem\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "PNI_lADOBYMIeM0lfM4ADfm9",
      });

      return {
        data: {},
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  await project.items.remove("PNI_lADOBYMIeM0lfM4ADfm9");
});

test("project.items.remove(unknownId)", async (t) => {
  const { getProjectFieldsQueryResultFixture } = await import(
    "./test/fixtures/get-project-fields/query-result.js"
  );

  const octokit = new Octokit();

  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectCoreData\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        org: "org",
        number: 1,
      });

      return {
        data: getProjectFieldsQueryResultFixture,
      };
    }
    if (/mutation deleteProjectNextItem\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "<unknown id>",
      });

      return {
        headers: {},
        data: {
          errors: [
            {
              type: "NOT_FOUND",
            },
          ],
        },
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  await project.items.remove("<unknown id>");
});

test("project.items.remove() with non-GraphQL error", async (t) => {
  const { getProjectFieldsQueryResultFixture } = await import(
    "./test/fixtures/get-project-fields/query-result.js"
  );

  const octokit = new Octokit();

  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectCoreData\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        org: "org",
        number: 1,
      });

      return {
        data: getProjectFieldsQueryResultFixture,
      };
    }
    if (/mutation deleteProjectNextItem\(/.test(options.query)) {
      throw new Error("oops");
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  try {
    await project.items.remove("<unknown id>");
    t.fail("Should have thrown");
  } catch (error) {
    t.deepEqual(error.message, "oops");
  }
});

test("project.items.remove() with unforeseen GraphQL error", async (t) => {
  const { getProjectFieldsQueryResultFixture } = await import(
    "./test/fixtures/get-project-fields/query-result.js"
  );

  const octokit = new Octokit();

  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectCoreData\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        org: "org",
        number: 1,
      });

      return {
        data: getProjectFieldsQueryResultFixture,
      };
    }
    if (/mutation deleteProjectNextItem\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "<unknown id>",
      });

      return {
        headers: {},
        data: {
          errors: [
            {
              type: "UNFORSEEN_ERROR",
            },
          ],
        },
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  try {
    await project.items.remove("<unknown id>");
    t.fail("Should have thrown");
  } catch (error) {
    t.deepEqual(error.name, "GraphqlResponseError");
  }
});

test("project.items.list() then project.items.remove(itemId) clears cache", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );

  const octokit = new Octokit();

  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        org: "org",
        number: 1,
      });

      return {
        data: getProjectItemsQueryResultFixture,
      };
    }
    if (/mutation deleteProjectNextItem\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "PNI_lADOBYMIeM0lfM4ADfm9",
      });

      return {
        data: {},
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  await project.items.list();
  await project.items.remove("PNI_lADOBYMIeM0lfM4ADfm9");
  const item = await project.items.get("PNI_lADOBYMIeM0lfM4ADfm9");
  t.deepEqual(item, undefined);
});

test("project.items.list() then project.items.remove() does not send mutation request", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );

  const octokit = new Octokit();

  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        org: "org",
        number: 1,
      });

      return {
        data: getProjectItemsQueryResultFixture,
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  await project.items.list();
  await project.items.remove("<unknown id>");
});

test("project.items.removeByContentId(contentId)", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );

  const octokit = new Octokit();

  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        org: "org",
        number: 1,
      });

      return {
        data: getProjectItemsQueryResultFixture,
      };
    }
    if (/mutation deleteProjectNextItem\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "PNI_lADOBYMIeM0lfM4ADfm9",
      });

      return {
        data: {},
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  await project.items.removeByContentId("I_kwDOGNkQys49IizC");

  const item = await project.items.getByContentId("I_kwDOGNkQys49IizC");
  t.deepEqual(item, undefined);
});

test("project.items.removeByContentId(unknownId) not found", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );

  const octokit = new Octokit();

  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        org: "org",
        number: 1,
      });

      return {
        data: getProjectItemsQueryResultFixture,
      };
    }
    if (/mutation deleteProjectNextItem\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "PNI_lADOBYMIeM0lfM4ADfm9",
      });

      return {
        data: {},
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  await project.items.removeByContentId("<unknown id>");
});

test("project.items.removeByContentRepositoryAndNumber(contentId)", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );

  const octokit = new Octokit();

  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        org: "org",
        number: 1,
      });

      return {
        data: getProjectItemsQueryResultFixture,
      };
    }
    if (/mutation deleteProjectNextItem\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "PNI_lADOBYMIeM0lfM4ADfm9",
      });

      return {
        data: {},
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  await project.items.removeByContentRepositoryAndNumber("example-product", 2);

  const item = await project.items.getByContentId("I_kwDOGNkQys49IizC");
  t.deepEqual(item, undefined);
});

test("project.items.removeByContentRepositoryAndNumber(unknownId) not found", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );

  const octokit = new Octokit();

  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        org: "org",
        number: 1,
      });

      return {
        data: getProjectItemsQueryResultFixture,
      };
    }
    if (/mutation deleteProjectNextItem\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "PNI_lADOBYMIeM0lfM4ADfm9",
      });

      return {
        data: {},
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
    },
  });

  await project.items.removeByContentRepositoryAndNumber("repository-name", -1);
});

test("project.items.updateByContentRepositoryAndNumber(contentNodeId, { status }) with unused custom field", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );
  const { issueItemFixture } = await import(
    "./test/fixtures/get-item/issue-item.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        org: "org",
        number: 1,
      });

      return {
        data: getProjectItemsQueryResultFixture,
      };
    }

    if (/mutation setItemProperties\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "PNI_lADOBYMIeM0lfM4ADfm9",
      });

      t.regex(options.query, /status: updateProjectNextItemField\(/);

      return { data: {} };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
  });

  const updatedItem = await project.items.updateByContentRepositoryAndNumber(
    "example-product",
    2,
    {
      status: "Ready",
    }
  );

  const {
    relevantToUsers,
    suggestedChangelog,
    "Ready For Work": readyForwork,
    ...itemFields
  } = issueItemFixture.fields;

  t.deepEqual(updatedItem, {
    ...issueItemFixture,
    fields: {
      ...itemFields,
      status: "Ready",
    },
  });
});

test("project.items.update(itemNodeId, fields) with field name containing whitespace", async (t) => {
  const { getProjectItemsPage1QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-1.js"
  );
  const { getProjectItemsPage2QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-2.js"
  );
  const { getProjectItemsPage3QueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result-items-page-3.js"
  );
  const { issueItemFixture } = await import(
    "./test/fixtures/get-item/issue-item.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      return {
        data: getProjectItemsPage1QueryResultFixture,
      };
    }

    if (/query getProjectItems\(/.test(options.query)) {
      if (options.variables.after === "PNI_lADOBYMIeM0lfM4AAzDD") {
        return {
          data: getProjectItemsPage2QueryResultFixture,
        };
      }

      return {
        data: getProjectItemsPage3QueryResultFixture,
      };
    }

    if (/mutation setItemProperties\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "PNI_lADOBYMIeM0lfM4ADfm9",
      });
      t.regex(options.query, /ReadyForWork: updateProjectNextItemField\(/);

      return {
        data: {},
      };
    }

    throw new Error(
      `Unexpected query:\n${prettier.format(options.query, {
        parser: "graphql",
      })}`
    );
  });

  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: "Suggested Changelog",
      "Ready For Work": "Ready For Work",
    },
  });

  const updatedItem = await project.items.update("PNI_lADOBYMIeM0lfM4ADfm9", {
    "Ready For Work": "Yes",
  });

  t.deepEqual(updatedItem, {
    ...issueItemFixture,
    fields: {
      ...issueItemFixture.fields,
      "Ready For Work": "Yes",
    },
  });
});

test("project.items.getByContentId(contentId) with optional user fields", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );
  const { issueItemFixture } = await import(
    "./test/fixtures/get-item/issue-item.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");
    t.deepEqual(options.variables, {
      org: "org",
      number: 1,
    });

    return {
      data: getProjectItemsQueryResultFixture,
    };
  });
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      unrealField: { name: "Field that DNE in project", optional: true },
      relevantToUsers: "Relevant to users?",
      suggestedChangelog: { name: "Suggested Changelog", optional: false },
      "Ready For Work": "Ready For Work",
    },
  });

  const item = await project.items.getByContentId("I_kwDOGNkQys49IizC");
  t.deepEqual(item, {
    ...issueItemFixture,
    fields: { ...issueItemFixture.fields },
  });
});

test("project.items.getByContentId(contentId) when non-optional user fields not found in project", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    t.deepEqual(options.method, "POST");
    t.deepEqual(options.url, "/graphql");
    t.deepEqual(options.variables, {
      org: "org",
      number: 1,
    });

    return {
      data: getProjectItemsQueryResultFixture,
    };
  });
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: { name: "Field that DNE in project", optional: false },
      "Ready For Work": "Ready For Work",
    },
  });

  try {
    await project.items.getByContentId("I_kwDOGNkQys49IizC");
    t.fail("Should have thrown");
  } catch (error) {
    t.deepEqual(
      error.message,
      '[github-project] "Field that DNE in project" could not be matched with any of the existing field names: "Title", "Assignees", "Status", "Labels", "Repository", "Milestone", "Relevant to users?", "Suggested Changelog", "Linked Pull Requests", "Ready For Work". If the field should be considered optional, then set it to "relevantToUsers: { name: "Field that DNE in project", optional: true}'
    );
  }
});
