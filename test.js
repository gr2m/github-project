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
    assignees: "Assignees",
    labels: "Labels",
    repository: "Repository",
    milestone: "Milestone",
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
    assignees: "Assignees",
    labels: "Labels",
    repository: "Repository",
    milestone: "Milestone",
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

test.run();
