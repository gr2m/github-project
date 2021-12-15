import { test } from "uvu";
import * as assert from "uvu/assert";
import { Octokit } from "@octokit/core";

import GitHubProject from "./index.js";

test("smoke", () => {
  assert.type(GitHubProject, "function");
});

test("constructor", () => {
  const octokit = new Octokit();
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
  });

  assert.equal(project.org, "org");
  assert.equal(project.number, 1);
  assert.equal(project.octokit, octokit);
  assert.equal(project.fields, {
    title: "Title",
    status: "Status",
  });
});

test("constructor with custom fields", () => {
  const octokit = new Octokit();
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      priority: "Priority",
    },
  });

  assert.equal(project.org, "org");
  assert.equal(project.number, 1);
  assert.equal(project.octokit, octokit);
  assert.equal(project.fields, {
    title: "Title",
    status: "Status",
    priority: "Priority",
  });
});

test("constructor with token", () => {
  const project = new GitHubProject({
    org: "org",
    number: 1,
    token: "ghp_secret123",
  });

  assert.instance(project.octokit, Octokit);
});

test("getters", () => {
  const project = new GitHubProject({
    org: "org",
    number: 1,
    token: "ghp_secret123",
  });

  assert.throws(() => {
    project.org = "org2";
  }, "Cannot set read-only property 'org'");
  assert.throws(() => {
    project.number = 2;
  }, "Cannot set read-only property 'number'");
  assert.throws(() => {
    project.octokit = new Octokit();
  }, "Cannot set read-only property 'octokit'");
  assert.throws(() => {
    project.fields = {};
  }, "Cannot set read-only property 'fields'");
});

test("project.items.list()", async () => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );
  const { listItemsFixture } = await import(
    "./test/fixtures/list-items/items.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    assert.equal(options.method, "POST");
    assert.equal(options.url, "/graphql");

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

  assert.equal(items, listItemsFixture);
});

test("project.items.list() with unknown column", async () => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    assert.equal(options.method, "POST");
    assert.equal(options.url, "/graphql");

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

  try {
    await project.items.list();
    assert.fail("should throw");
  } catch (error) {
    assert.equal(error.message, "Unknown column name: Relevant to users?");
  }
});

test("project.items.list() multiple calls only send query once", async () => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );

  const octokit = new Octokit();
  let queryCounter = 0;
  octokit.hook.wrap("request", async (request, options) => {
    queryCounter++;
    assert.equal(options.method, "POST");
    assert.equal(options.url, "/graphql");

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

  assert.equal(queryCounter, 1);
});

test("project.items.add() issue", async () => {
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
    assert.equal(options.method, "POST");
    assert.equal(options.url, "/graphql");

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

    throw new Error(`Unexpected query: ${options.query}`);
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
  assert.equal(newItem, newIssueItemFixture);
});

test("project.items.add() issue with custom fields", async () => {
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
    assert.equal(options.method, "POST");
    assert.equal(options.url, "/graphql");

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

    throw new Error(`Unexpected query: ${options.query}`);
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
  assert.equal(newItem, {
    ...newIssueItemFixture,
    fields: {
      ...newIssueItemFixture.fields,
      status: "Done",
    },
  });
});

test("project.items.add() pull request", async () => {
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
    assert.equal(options.method, "POST");
    assert.equal(options.url, "/graphql");

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

    throw new Error(`Unexpected query: ${options.query}`);
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
  assert.equal(newItem, newPullRequestItemFixture);
});

test("project.items.add() with unknown column", async () => {
  const { getProjectFieldsQueryResultFixture } = await import(
    "./test/fixtures/get-project-fields/query-result.js"
  );
  const { addIssueItemQueryResultFixture } = await import(
    "./test/fixtures/add-item/issue/query-result.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    assert.equal(options.method, "POST");
    assert.equal(options.url, "/graphql");

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

    throw new Error(`Unexpected query: ${options.query}`);
  });
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {},
  });

  try {
    await project.items.add("issue node_id");
    assert.fail("should throw");
  } catch (error) {
    assert.equal(error.message, "Unknown column name: Relevant to users?");
  }
});

test("project.items.add() multiple calls sends query to load fields only once", async () => {
  const { getProjectFieldsQueryResultFixture } = await import(
    "./test/fixtures/get-project-fields/query-result.js"
  );
  const { addIssueItemQueryResultFixture } = await import(
    "./test/fixtures/add-item/issue/query-result.js"
  );

  let queryCounter = 0;

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    assert.equal(options.method, "POST");
    assert.equal(options.url, "/graphql");

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

    throw new Error(`Unexpected query: ${options.query}`);
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
  assert.equal(queryCounter, 1);
});

test("project.items.add() after project.items.list() does not send getProjectCoreData query", async () => {
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

    throw new Error(`Unexpected query: ${options.query}`);
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
  assert.equal(queryCounter, 2);
});

test("project.items.add() adding existing item after project.items.list() does not send query to add item again", async () => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );

  const octokit = new Octokit();
  let queryCounter = 0;
  octokit.hook.wrap("request", async (request, options) => {
    queryCounter++;

    assert.match(options.query, /query getProjectWithItems\(/);

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
  assert.equal(queryCounter, 1);
});

test("project.items.get(contentId)", async () => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );
  const { issueItemFixture } = await import(
    "./test/fixtures/get-item/issue-item.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    assert.equal(options.method, "POST");
    assert.equal(options.url, "/graphql");
    assert.equal(options.variables, {
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

  assert.equal(item, issueItemFixture);
});

test("project.items.get() not found", async () => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    assert.equal(options.method, "POST");
    assert.equal(options.url, "/graphql");
    assert.equal(options.variables, {
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

  assert.equal(item, undefined);
});

test("project.items.get(itemId)", async () => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );
  const { draftItemFixture } = await import(
    "./test/fixtures/get-item/draft-item.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    assert.equal(options.method, "POST");
    assert.equal(options.url, "/graphql");
    assert.equal(options.variables, {
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

  assert.equal(item, draftItemFixture);
});

test("project.items.update(id, fields) where id is issue node id", async () => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );
  const { issueItemFixture } = await import(
    "./test/fixtures/get-item/issue-item.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    assert.equal(options.method, "POST");
    assert.equal(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      assert.equal(options.variables, {
        org: "org",
        number: 1,
      });

      return {
        data: getProjectItemsQueryResultFixture,
      };
    }

    if (/mutation setItemProperties\(/.test(options.query)) {
      assert.equal(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "PNI_lADOBYMIeM0lfM4ADfm9",
      });
      assert.match(
        options.query,
        /relevantToUsers: updateProjectNextItemField\(/
      );

      return { data: {} };
    }

    throw new Error(`Unexpected query: ${options.query}`);
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

  const updatedItem = await project.items.update("I_kwDOGNkQys49IizC", {
    relevantToUsers: "yes",
    suggestedChangelog: "this is what changed",
    // properties not set to a string or `null` are ignored
    status: undefined,
  });

  assert.equal(updatedItem, {
    ...issueItemFixture,
    fields: {
      ...issueItemFixture.fields,
      relevantToUsers: "yes",
      suggestedChangelog: "this is what changed",
    },
  });
});

test("project.items.update(id, fields) where id is item node id", async () => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );
  const { issueItemFixture } = await import(
    "./test/fixtures/get-item/issue-item.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    assert.equal(options.method, "POST");
    assert.equal(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      assert.equal(options.variables, {
        org: "org",
        number: 1,
      });

      return {
        data: getProjectItemsQueryResultFixture,
      };
    }

    if (/mutation setItemProperties\(/.test(options.query)) {
      assert.equal(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "PNI_lADOBYMIeM0lfM4ADfm9",
      });
      assert.match(
        options.query,
        /relevantToUsers: updateProjectNextItemField\(/
      );

      return { data: {} };
    }

    throw new Error(`Unexpected query: ${options.query}`);
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
    relevantToUsers: "yes",
  });

  assert.equal(updatedItem, {
    ...issueItemFixture,
    fields: {
      ...issueItemFixture.fields,
      relevantToUsers: "yes",
    },
  });
});

test("project.items.update(id, fields) where id is not found", async () => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./test/fixtures/get-project-items/query-result.js"
  );
  const { issueItemFixture } = await import(
    "./test/fixtures/get-item/issue-item.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    assert.equal(options.method, "POST");
    assert.equal(options.url, "/graphql");

    if (/query getProjectWithItems\(/.test(options.query)) {
      assert.equal(options.variables, {
        org: "org",
        number: 1,
      });

      return {
        data: getProjectItemsQueryResultFixture,
      };
    }

    if (/mutation setItemProperties\(/.test(options.query)) {
      assert.equal(options.variables, {
        projectId: "PN_kwDOBYMIeM0lfA",
        itemId: "PNI_lADOBYMIeM0lfM4ADfm9",
      });
      assert.match(
        options.query,
        /relevantToUsers: updateProjectNextItemField\(/
      );

      return { data: {} };
    }

    throw new Error(`Unexpected query: ${options.query}`);
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

  assert.equal(updatedItem, undefined);
});

test.run();
