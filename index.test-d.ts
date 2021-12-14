import { expectType } from "tsd";
import { Octokit } from "@octokit/core";
import GitHubProject from "./index";

export function smokeTest() {
  expectType<typeof GitHubProject>(GitHubProject);
}

export function constructorTest() {
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit: new Octokit(),
  });

  expectType<string>(project.org);
  expectType<number>(project.number);
  expectType<Octokit>(project.octokit);
  expectType<"Title">(project.fields.title);
  expectType<"Assignees">(project.fields.assignees);
  expectType<"Labels">(project.fields.labels);
  expectType<"Repository">(project.fields.repository);
  expectType<"Milestone">(project.fields.milestone);
}

export function constructorWithCustomFieldsTest() {
  const project = new GitHubProject({
    org: "org",
    number: 1,
    octokit: new Octokit(),
    fields: {
      priority: "Priority",
    },
  });

  expectType<string>(project.org);
  expectType<number>(project.number);
  expectType<Octokit>(project.octokit);
  expectType<"Title">(project.fields.title);
  expectType<"Assignees">(project.fields.assignees);
  expectType<"Labels">(project.fields.labels);
  expectType<"Repository">(project.fields.repository);
  expectType<"Milestone">(project.fields.milestone);
  expectType<string>(project.fields.priority);
}
