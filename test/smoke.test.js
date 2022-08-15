import test from "ava";

import GitHubProject from "../index.js";

test("GitHubProject", (t) => {
  t.is(typeof GitHubProject, "function");
});

test("getters", (t) => {
  const project = new GitHubProject({
    owner: "owner",
    number: 1,
    token: "ghp_secret123",
  });

  t.throws(
    () => {
      project.owner = "org2";
    },
    undefined,
    "Cannot set read-only property 'owner'"
  );
  t.throws(
    () => {
      project.number = 2;
    },
    undefined,
    "Cannot set read-only property 'number'"
  );
  t.throws(
    () => {
      project.octokit = new Octokit();
    },
    undefined,
    "Cannot set read-only property 'octokit'"
  );
  t.throws(
    () => {
      project.fields = {};
    },
    undefined,
    "Cannot set read-only property 'fields'"
  );
});
