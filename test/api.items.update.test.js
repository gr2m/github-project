import test from "ava";
import { Octokit } from "@octokit/core";
import prettier from "prettier";
import GitHubProject from "../index.js";

test("project.items.updateByContentId(contentNodeId, fields) with optional, non-existing fields", async (t) => {
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
    "./fixtures/get-project-items/query-result.js"
  );
  const { issueItemFixture } = await import(
    "./fixtures/get-item/issue-item.js"
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
    "./fixtures/get-project-items/query-result.js"
  );
  const { issueItemFixture } = await import(
    "./fixtures/get-item/issue-item.js"
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

test("project.items.updateByContentRepositoryAndNumber(contentNodeId, { status }) with unused custom field", async (t) => {
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
    "./fixtures/get-project-items/query-result-items-page-1.js"
  );
  const { getProjectItemsPage2QueryResultFixture } = await import(
    "./fixtures/get-project-items/query-result-items-page-2.js"
  );
  const { getProjectItemsPage3QueryResultFixture } = await import(
    "./fixtures/get-project-items/query-result-items-page-3.js"
  );
  const { issueItemFixture } = await import(
    "./fixtures/get-item/issue-item.js"
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
