import test from "ava";
import { Octokit } from "@octokit/core";
import prettier from "prettier";

import GitHubProject from "./index.js";

test("smoke", (t) => {
  t.is(typeof GitHubProject, "function");
});

test("constructor", (t) => {
  const octokit = new Octokit();
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
  });

  t.deepEqual(project.org, "org");
  t.deepEqual(project.number, 1);
  t.deepEqual(project.octokit, octokit);
  t.deepEqual(project.fields, {
    title: "Title",
    status: "Status",
  });
});

test("constructor with custom fields", (t) => {
  const octokit = new Octokit();
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      priority: "Priority",
    },
  });

  t.deepEqual(project.org, "org");
  t.deepEqual(project.number, 1);
  t.deepEqual(project.octokit, octokit);
  t.deepEqual(project.fields, {
    title: "Title",
    status: "Status",
    priority: "Priority",
  });
});

test("constructor with token", (t) => {
  const project = new GitHubProject({
    org: "org",
    number: 1,
    token: "ghp_secret123",
  });

  t.true(project.octokit instanceof Octokit);
});

test("`matchFieldName` constructor option", async (t) => {
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
  const matchFieldNameArguments = [];
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Something totally different!",
    },
    matchFieldName(projectFieldName, userFieldName) {
      matchFieldNameArguments.push({ projectFieldName, userFieldName });
      return projectFieldName === "relevant to users?";
    },
  });

  const items = await project.items.list();

  t.snapshot(matchFieldNameArguments, "matchFieldNameArguments");
  t.snapshot(items, "items");
});

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
      isDraft: true,
    },
    {
      id: "PNI_lADOBYMIeM0lfM4AAzDx",
      fields: { title: "Update README.md", status: "In Progress" },
      isDraft: false,
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
      fields: {
        title: "Enforce setting project via github actions",
        status: null,
      },
      isDraft: false,
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
    fields: {
      title: "Enforce setting project via github actions",
      status: null,
    },
    isDraft: false,
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
    },
  });

  const item = await project.items.getByContentRepositoryAndNumber(
    "example-product",
    2
  );
  t.deepEqual(item, issueItemFixture);
});

test("project.items.update(itemNodeId, fields) unsetting a field (#10)", async (t) => {
  const { getProjectFieldsQueryResultFixture } = await import(
    "./test/fixtures/get-project-fields/query-result.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    if (/query getProjectCoreData\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        org: "org",
        number: 1,
      });

      return {
        data: getProjectFieldsQueryResultFixture,
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
        data: {
          data: {
            relevantToUsers: {
              projectNextItem: {
                fieldValues: {
                  nodes: [],
                },
              },
            },
            suggestedChangelog: {},
          },
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

  await project.items.update("PNI_lADOBYMIeM0lfM4ADfm9", {
    relevantToUsers: null,
  });
});

test("project.items.update(itemNodeId, fields)", async (t) => {
  const { getProjectFieldsQueryResultFixture } = await import(
    "./test/fixtures/get-project-fields/query-result.js"
  );
  const { issueItemFixture } = await import(
    "./test/fixtures/get-item/issue-item.js"
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

    if (/mutation setItemProperties\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "PNI_lADOBYMIeM0lfM4ADfm9",
      });
      t.regex(options.query, /relevantToUsers: updateProjectNextItemField\(/);

      return {
        data: {
          data: {
            relevantToUsers: {
              projectNextItem: {
                id: "PNI_lADOBYMIeM0lfM4ADfm9",
                title: "Enforce setting project via github actions",
                content: {
                  __typename: "Issue",
                  id: "I_kwDOGNkQys49IizC",
                  number: 2,
                  url: "https://github.com/gr2m-issues-automation-sandbox/example-product/issues/2",
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
                    {
                      // Yes
                      value: "c9823470",
                      projectField: {
                        // relevantToUsers
                        id: "MDE2OlByb2plY3ROZXh0RmllbGQ3MTMyMw==",
                      },
                    },
                    {
                      value: "this and that",
                      projectField: {
                        // suggestedChangelog
                        id: "MDE2OlByb2plY3ROZXh0RmllbGQ3MTMyNA==",
                      },
                    },
                  ],
                },
              },
            },
            suggestedChangelog: {},
          },
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

    if (/mutation setItemProperties\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "<unknown id>",
      });
      t.regex(options.query, /relevantToUsers: updateProjectNextItemField\(/);

      return {
        headers: {},
        data: {
          errors: [
            {
              type: "NOT_FOUND",
              path: ["relevantToUsers"],
              locations: [
                {
                  line: 2,
                  column: 3,
                },
              ],
              message:
                "Could not resolve to a node with the global id of '<unknown id>'",
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

  const updatedItem = await project.items.update("<unknown id>", {
    relevantToUsers: "yes",
  });

  t.deepEqual(updatedItem, undefined);
});

test("project.items.update(itemNodeId, fields) unforeseen GraphQL error", async (t) => {
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

    if (/mutation setItemProperties\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "<unknown id>",
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
    await project.items.update("<unknown id>", {
      relevantToUsers: "yes",
    });
    t.fail("Should have thrown");
  } catch (error) {
    t.deepEqual(error.name, "GraphqlResponseError");
  }
});

test("project.items.update(itemNodeId, fields) with non GraphQL error", async (t) => {
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
    await project.items.update("<unknown id>", {
      relevantToUsers: "yes",
    });
    t.fail("should have thrown");
  } catch (error) {
    t.deepEqual(error.message, "oops");
  }
});

test("project.items.update(itemNodeId, fields) where fields include a built-in read-only project field", async (t) => {
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
      '[github-project] "What is that?" could not be matched with any of the existing field names: "Title", "Assignees", "Status", "Labels", "Repository", "Milestone", "Relevant to users?", "Suggested Changelog", "Linked Pull Requests"'
    );
  }
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
    },
  });

  const updatedItem = await project.items.updateByContentId(
    "I_kwDOGNkQys49IizC",
    {
      relevantToUsers: "yes",
    }
  );

  t.deepEqual(updatedItem, {
    ...issueItemFixture,
    fields: {
      ...issueItemFixture.fields,
      relevantToUsers: "yes",
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
    relevantToUsers: "yes",
  });

  t.deepEqual(updatedItem, undefined);
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
    },
  });

  const updatedItem = await project.items.updateByContentRepositoryAndNumber(
    "example-product",
    2,
    {
      relevantToUsers: "yes",
    }
  );

  t.deepEqual(updatedItem, {
    ...issueItemFixture,
    fields: {
      ...issueItemFixture.fields,
      relevantToUsers: "yes",
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

  const { relevantToUsers, suggestedChangelog, ...itemFields } =
    issueItemFixture.fields;

  t.deepEqual(updatedItem, {
    ...issueItemFixture,
    fields: {
      ...itemFields,
      status: "Ready",
    },
  });
});
