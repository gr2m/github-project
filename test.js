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
  const { allTypesQueryResult } = await import(
    "./test/fixtures/list-items/all-types/query-result.js"
  );
  const { allTypesItems } = await import(
    "./test/fixtures/list-items/all-types/items.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    assert.equal(options.method, "POST");
    assert.equal(options.url, "/graphql");

    return {
      data: allTypesQueryResult,
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

  assert.equal(items, allTypesItems);
});

test("project.items.list() with unknown column", async () => {
  const { allTypesQueryResult } = await import(
    "./test/fixtures/list-items/all-types/query-result.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    assert.equal(options.method, "POST");
    assert.equal(options.url, "/graphql");

    return {
      data: allTypesQueryResult,
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

test("project.items.add() issue", async () => {
  const { getProjectCoreDataQueryResultFixture } = await import(
    "./test/fixtures/get-project-core-data/query-result.js"
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

    if (/query getMemexProjectCoreData/.test(options.query)) {
      return {
        data: getProjectCoreDataQueryResultFixture,
      };
    }

    if (/mutation addIssueToProject/.test(options.query)) {
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

test("project.items.add() pull request", async () => {
  const { getProjectCoreDataQueryResultFixture } = await import(
    "./test/fixtures/get-project-core-data/query-result.js"
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

    if (/query getMemexProjectCoreData/.test(options.query)) {
      return {
        data: getProjectCoreDataQueryResultFixture,
      };
    }

    if (/mutation addIssueToProject/.test(options.query)) {
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
  const { getProjectCoreDataQueryResultFixture } = await import(
    "./test/fixtures/get-project-core-data/query-result.js"
  );
  const { addIssueItemQueryResultFixture } = await import(
    "./test/fixtures/add-item/issue/query-result.js"
  );

  const octokit = new Octokit();
  octokit.hook.wrap("request", async (request, options) => {
    assert.equal(options.method, "POST");
    assert.equal(options.url, "/graphql");

    if (/query getMemexProjectCoreData/.test(options.query)) {
      return {
        data: getProjectCoreDataQueryResultFixture,
      };
    }

    if (/mutation addIssueToProject/.test(options.query)) {
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

test.run();
