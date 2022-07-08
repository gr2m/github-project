import test from "ava";
import { Octokit } from "@octokit/core";
import GitHubProject from "../index.js";

test("project.items.get(itemId)", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./fixtures/get-project-items/query-result.js"
  );
  const { draftItemFixture } = await import(
    "./fixtures/get-item/draft-item.js"
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
    "./fixtures/get-project-items/query-result.js"
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
    "./fixtures/get-project-items/query-result.js"
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
    "./fixtures/get-project-items/query-result.js"
  );
  const { issueItemFixture } = await import(
    "./fixtures/get-item/issue-item.js"
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
    "./fixtures/get-project-items/query-result.js"
  );
  const { issueItemFixture } = await import(
    "./fixtures/get-item/issue-item.js"
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

test("project.items.getByContentId(contentId) with optional user fields", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./fixtures/get-project-items/query-result.js"
  );
  const { issueItemFixture } = await import(
    "./fixtures/get-item/issue-item.js"
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
    "./fixtures/get-project-items/query-result.js"
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
