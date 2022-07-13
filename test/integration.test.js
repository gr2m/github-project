import test from "ava";
import { Octokit } from "@octokit/core";
import prettier from "prettier";
import GitHubProject from "../index.js";

test("project.items.list() then project.items.remove(itemId) clears cache", async (t) => {
  const { getProjectItemsQueryResultFixture } = await import(
    "./fixtures/get-project-items/query-result.js"
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
    "./fixtures/get-project-items/query-result.js"
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
