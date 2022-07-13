// @ts-check

import { readdir, writeFile } from "node:fs/promises";

import dotenv from "dotenv";
import { App } from "@octokit/app";

import Octokit from "./_lib/octokit.js";
import GitHubProject from "../../index.js";
import { clearTestProject } from "./_lib/clear-test-project.js";
import { deleteAllTestRepositories } from "./_lib/delete-all-test-repositories.js";
import { createRepository } from "./_lib/create-test-repository.js";

dotenv.config();

recordFixtures();

async function recordFixtures() {
  if (
    !process.env.PROJECT_NUMBER ||
    !process.env.GH_PROJECT_FIXTURES_APP_ID ||
    !process.env.GH_PROJECT_FIXTURES_APP_PRIVATE_KEY
  ) {
    throw new Error(
      "PROJECT_NUMBER, GH_PROJECT_FIXTURES_APP_ID, and GH_PROJECT_FIXTURES_APP_PRIVATE_KEY are required. Add the them to your local `.env`"
    );
  }

  const app = new App({
    appId: process.env.GH_PROJECT_FIXTURES_APP_ID,
    privateKey: process.env.GH_PROJECT_FIXTURES_APP_PRIVATE_KEY,
    Octokit,
  });

  app.eachInstallation(async ({ installation, octokit }) => {
    const projectNumber = Number(process.env.PROJECT_NUMBER);
    // @ts-expect-error - we can be sure that installaction.account is set
    const owner = String(installation.account.login);

    // log what we are doing
    octokit.hook.wrap("request", (request, options) => {
      console.log(`[record] ${options.method} ${options.url}`);
      if (options.url === "/graphql") {
        // @ts-expect-error - options.query is always set for `/graphql` requests
        console.log("         " + options.query.trim().split("\n")[0] + " … }");
      }
      return request(options);
    });

    // we use two project instances, one for setting up state, and
    // the other for testing, without the two instances sharing internal state / caching.
    const projectOptions = {
      org: owner,
      number: projectNumber,
      octokit,
      fields: {
        text: "Text",
        number: "Number",
        date: "Date",
        singleSelect: "Single select",
      },
    };

    const testFolders = await readdir("test/recorded");

    for (const testFolder of testFolders) {
      if (
        [`_lib`, `snapshots`].includes(testFolder) ||
        testFolder.endsWith(`.js`)
      ) {
        continue;
      }

      if (testFolder === "api.items.list-with-pagination") {
        console.log(
          "Skipping recording fixtures for 'api.items.list-with-pagination' because it takes forever to update. Comment out this if block if you really need it."
        );
        continue;
      }

      // if (testFolder !== "api.items.remove") continue;

      console.log("Recording fixtures for %s", testFolder);

      const setupProject = new GitHubProject(projectOptions);
      const testProject = new GitHubProject(projectOptions);

      // create a clean slate
      await clearTestProject(setupProject);
      await deleteAllTestRepositories(octokit, owner);

      // create a test repository
      const repository = await createRepository(octokit, owner);

      // import record and test scripts
      const { prepare } = await import(`./${testFolder}/prepare.js`);
      const { test } = await import(`./${testFolder}/test.js`);

      // prepare recording fixtures
      const args = await prepare(repository, octokit, setupProject);

      // do the recording
      const fixtures = [];
      octokit.hook.wrap("request", async (request, options) => {
        const response = await request(options);
        fixtures.push({
          query: options.query,
          variables: options.variables,
          response,
        });
        return response;
      });

      await test(testProject, ...args);

      // normalize fixtures
      const counters = {};
      const idMappings = {};
      const fixturesJSON = JSON.stringify(fixtures, null, 2)
        .replaceAll(
          /"(id|projectId|contentId|itemId)": "([^_]+)_([^"]+)"/g,
          (match, key, prefix, id) => {
            if (!idMappings[id]) {
              if (!counters[prefix]) counters[prefix] = 0;
              idMappings[id] = ++counters[prefix];
            }

            return `"${key}": "${prefix}_${idMappings[id]}"`;
          }
        )
        .replaceAll(repository.name, "test-repository")
        .replaceAll(
          /"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z"/g,
          '"2022-02-02T12:00:00Z"'
        );

      const fixturesPath = `test/recorded/${testFolder}/fixtures.json`;
      await writeFile(fixturesPath, fixturesJSON);
      console.log("%s written", fixturesPath);
    }
  });
}
