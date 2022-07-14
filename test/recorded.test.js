import { readFile, readdir } from "node:fs/promises";

import avaTest from "ava";
import { Octokit } from "@octokit/core";

import GitHubProject from "../index.js";

const OWNER = "github-project-fixtures";
const PROJECT_NUMBER = 2;

runTests(OWNER, PROJECT_NUMBER);

async function runTests(owner, projectNumber) {
  const testFolders = await readdir("test/recorded");

  for (const testFolder of testFolders) {
    if (
      [`_lib`, `snapshots`].includes(testFolder) ||
      testFolder.endsWith(`.js`)
    ) {
      continue;
    }

    avaTest.serial(`${testFolder}`, async (t) => {
      const { test } = await import(`./recorded/${testFolder}/test.js`);
      const fixturesPath = `test/recorded/${testFolder}/fixtures.json`;
      const fixtures = JSON.parse(await readFile(fixturesPath, "utf8"));

      const octokit = new Octokit();
      const project = new GitHubProject({
        org: owner,
        number: projectNumber,
        octokit,
        fields: {
          text: "Text",
          number: "Number",
          date: "Date",
          singleSelect: "Single select",
        },
      });

      octokit.hook.wrap("request", async (request, options) => {
        console.log("[fixture] %s %s", options.method, options.url);
        if (options.url === "/graphql") {
          console.log(options.query.trim().split("\n")[0] + " … }");
        }
        const { response } = fixtures.shift();
        return response;
      });

      const result = await test(project);
      t.snapshot(result);
    });
  }
}
