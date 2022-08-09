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
