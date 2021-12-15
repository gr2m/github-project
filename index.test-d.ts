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
  expectType<"Status">(project.fields.status);
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
  expectType<"Status">(project.fields.status);
  expectType<string>(project.fields.priority);
}

export function constructorWithTokenTest() {
  const project = new GitHubProject({
    org: "org",
    number: 1,
    token: "gpg_secret123",
  });

  expectType<string>(project.org);
  expectType<number>(project.number);
  expectType<Octokit>(project.octokit);
}

export function gettersTest() {
  const project = new GitHubProject({
    org: "org",
    number: 1,
    token: "gpg_secret123",
  });

  // @ts-expect-error - `.org` is a getter
  project.org = "org";
  // @ts-expect-error - `.number` is a getter
  project.number = 2;
  // @ts-expect-error - `.octokit` is a getter
  project.octokit = new Octokit();
  // @ts-expect-error - `.fields` is a getter
  project.fields = {};
}

export async function listItemsTest() {
  const project = new GitHubProject({
    org: "org",
    number: 1,
    token: "gpg_secret123",
  });
  const [item] = await project.items.list();

  if (item.isDraft === true) {
    expectType<string>(item.id);
    expectType<"Title">(item.fields.title);

    // @ts-expect-error - `.content` is not set if `.isDraft` is true
    item.content;
  } else {
    expectType<string>(item.id);
    expectType<"Title">(item.fields.title);

    expectType<number>(item.content.number);
  }
}

export async function addItemTest() {
  const project = new GitHubProject({
    org: "org",
    number: 1,
    token: "gpg_secret123",
  });
  const item = await project.items.add("issue node_id");

  expectType<string>(item.id);
  expectType<false>(item.isDraft);
  expectType<"Title">(item.fields.title);

  expectType<number>(item.content.number);
}

export async function addItemWithFieldsTest() {
  const project = new GitHubProject({
    org: "org",
    number: 1,
    token: "gpg_secret123",
    fields: {
      myField: "My Field",
    },
  });
  const item = await project.items.add("issue node_id", {
    myField: "my value",
  });

  expectType<string>(item.id);
  expectType<false>(item.isDraft);
  expectType<"Title">(item.fields.title);

  expectType<number>(item.content.number);
}

export async function getItemTest() {
  const project = new GitHubProject({
    org: "org",
    number: 1,
    token: "gpg_secret123",
  });
  const item = await project.items.get("item node id");

  if (typeof item === "undefined") {
    expectType<undefined>(item);
    return;
  }

  if (item.isDraft === true) {
    expectType<string>(item.id);
    expectType<"Title">(item.fields.title);

    // @ts-expect-error - `.content` is not set if `.isDraft` is true
    item.content;
  } else {
    expectType<string>(item.id);
    expectType<"Title">(item.fields.title);

    expectType<number>(item.content.number);
  }
}

export async function getItemByContentIdTest() {
  const project = new GitHubProject({
    org: "org",
    number: 1,
    token: "gpg_secret123",
  });
  const item = await project.items.getByContentId("content node id");

  if (typeof item === "undefined") {
    expectType<undefined>(item);
    return;
  }

  if (item.isDraft === true) {
    expectType<string>(item.id);
    expectType<"Title">(item.fields.title);

    // @ts-expect-error - `.content` is not set if `.isDraft` is true
    item.content;
  } else {
    expectType<string>(item.id);
    expectType<"Title">(item.fields.title);

    expectType<number>(item.content.number);
  }
}

export async function updateItemTest() {
  const project = new GitHubProject({
    org: "org",
    number: 1,
    token: "gpg_secret123",
  });
  const item = await project.items.update("issue node_id", {
    status: "new status",
  });

  if (typeof item === "undefined") {
    expectType<undefined>(item);
    return;
  }

  if (item.isDraft === true) {
    expectType<string>(item.id);
    expectType<"Title">(item.fields.title);

    // @ts-expect-error - `.content` is not set if `.isDraft` is true
    item.content;
  } else {
    expectType<string>(item.id);
    expectType<"Title">(item.fields.title);

    expectType<number>(item.content.number);
  }
}

export async function removeItemTest() {
  const project = new GitHubProject({
    org: "org",
    number: 1,
    token: "gpg_secret123",
  });
  const result = await project.items.remove("issue node_id");

  expectType<void>(result);
}
