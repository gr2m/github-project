import test from "ava";
import { Octokit } from "@octokit/core";
import prettier from "prettier";
import GitHubProject from "../index.js";

test("project.items.add() issue", async (t) => {
  const { getProjectFieldsQueryResultFixture } = await import(
    "./fixtures/get-project-fields/query-result.js"
  );
  const { addIssueItemQueryResultFixture } = await import(
    "./fixtures/add-item/issue/query-result.js"
  );
  const { newIssueItemFixture } = await import(
    "./fixtures/add-item/issue/new-issue-item.js"
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
    "./fixtures/get-project-fields/query-result.js"
  );
  const { addIssueItemQueryResultFixture } = await import(
    "./fixtures/add-item/issue/query-result.js"
  );
  const { newIssueItemFixture } = await import(
    "./fixtures/add-item/issue/new-issue-item.js"
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
    "./fixtures/get-project-fields/query-result.js"
  );
  const { addPullRequestItemQueryResultFixture } = await import(
    "./fixtures/add-item/pull-request/query-result.js"
  );
  const { newPullRequestItemFixture } = await import(
    "./fixtures/add-item/pull-request/new-pull-request-item.js"
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
    "./fixtures/get-project-fields/query-result.js"
  );
  const { addIssueItemQueryResultFixture } = await import(
    "./fixtures/add-item/issue/query-result.js"
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
      databaseId: 1025649858
    },
  });
});
test("project.items.add() multiple calls sends query to load fields only once", async (t) => {
  const { getProjectFieldsQueryResultFixture } = await import(
    "./fixtures/get-project-fields/query-result.js"
  );
  const { addIssueItemQueryResultFixture } = await import(
    "./fixtures/add-item/issue/query-result.js"
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
    "./fixtures/get-project-items/query-result.js"
  );
  const { addIssueItemQueryResultFixture } = await import(
    "./fixtures/add-item/issue/query-result.js"
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
    "./fixtures/get-project-items/query-result.js"
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
    "./fixtures/get-project-items/query-result.js"
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
    "./fixtures/get-project-fields/query-result.js"
  );
  const { addIssueItemQueryResultFixture } = await import(
    "./fixtures/add-item/issue/query-result.js"
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
    "./fixtures/get-project-fields/query-result.js"
  );
  const { addIssueItemQueryResultFixture } = await import(
    "./fixtures/add-item/issue/query-result.js"
  );
  const { newIssueItemFixture } = await import(
    "./fixtures/add-item/issue/new-issue-item.js"
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
