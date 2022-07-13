import { readdir, writeFile } from "node:fs/promises";

import Octokit from "./_lib/octokit.js";
import GitHubProject from "../../index.js";
import { clearTestProject } from "./_lib/clear-test-project.js";
import { deleteAllTestRepositories } from "./_lib/delete-all-test-repositories.js";
import { createRepository } from "./_lib/create-test-repository.js";

const OWNER = "github-project-fixtures";
const PROJECT_NUMBER = 2;

recordFixtures(OWNER, PROJECT_NUMBER);

async function recordFixtures(owner, projectNumber) {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is not set");
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  // verify authorization
  const { headers } = await octokit.request("HEAD /");
  const scopes = headers["x-oauth-scopes"].split(/\s*,\s*/);

  if (!scopes.includes("delete_repo")) {
    throw Error('"delete_repo" scope is required');
  }

  if (!scopes.includes("write:org")) {
    throw Error('"write:org" scope is required');
  }

  if (!scopes.includes("repo") && !scopes.includes("public_repo")) {
    throw Error('"repo" or "public_repo" scope is required');
  }

  // log what we are doing
  octokit.hook.wrap("request", (request, options) => {
    console.log(`[record] ${options.method} ${options.url}`);
    if (options.url === "/graphql") {
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
    const args = await prepare(repository, octokit, testProject);

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
        /"(id|projectId|contentId)": "([^_]+)_([^"]+)"/g,
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
}
