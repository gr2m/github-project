import test from "ava";
import { Octokit } from "@octokit/core";
import prettier from "prettier";
import GitHubProject from "../index.js";

test("project.items.list()", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./fixtures/get-project-items/query-result.js"
  );
  const { listItemsFixture } = await import("./fixtures/list-items/items.js");

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
    "./fixtures/get-project-items/query-result.js"
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
        databaseId: 757727957
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
        databaseId: 1025649858
      },
    },
  ]);
});
test("project.items.list() multiple calls only send query once", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./fixtures/get-project-items/query-result.js"
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
    "./fixtures/get-project-items/query-result.js"
  );
  const { listItemsFixture } = await import("./fixtures/list-items/items.js");

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
  const { listItemsFixture } = await import("./fixtures/list-items/items.js");
  const { getProjectItemsPage1QueryResultFixture } = await import(
    "./fixtures/get-project-items/query-result-items-page-1.js"
  );
  const { getProjectItemsPage2QueryResultFixture } = await import(
    "./fixtures/get-project-items/query-result-items-page-2.js"
  );
  const { getProjectItemsPage3QueryResultFixture } = await import(
    "./fixtures/get-project-items/query-result-items-page-3.js"
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
