import test from "ava";
import { Octokit } from "@octokit/core";

import GitHubProject from "../index.js";

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

test("`matchFieldOptionValue` constructor option", async (t) => {
  const { getProjectFieldsQueryResultFixture } = await import(
    "./fixtures/get-project-fields/query-result.js"
  );
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

    if (/query getProjectCoreData\(/.test(options.query)) {
      t.deepEqual(options.variables, {
        org: "org",
        number: 1,
      });

      return {
        data: getProjectFieldsQueryResultFixture,
      };
    }

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

  const matchFieldOptionValueArguments = [];
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit,
    fields: {
      relevantToUsers: "Relevant to users?",
    },
    matchFieldOptionValue(fieldOptionValue, userValue) {
      matchFieldOptionValueArguments.push({ fieldOptionValue, userValue });

      return fieldOptionValue === "Yes";
    },
  });

  const updatedItem = await project.items.update("PNI_lADOBYMIeM0lfM4ADfm9", {
    relevantToUsers: "yep",
  });

  t.snapshot(matchFieldOptionValueArguments, "matchFieldOptionValueArguments");
  t.snapshot(updatedItem, "updatedItem");
});
