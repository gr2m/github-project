import { expectType, expectNotType } from "tsd";
import { Octokit } from "@octokit/core";
import GitHubProject, {
  GitHubProjectError,
  GitHubProjectUnknownFieldError,
  GitHubProjectUnknownFieldOptionError,
} from "./index";

export function smokeTest() {
  expectType<typeof GitHubProject>(GitHubProject);
}

export function constructorTest() {
  const project = new GitHubProject({
    owner: "owner",
    number: 1,
    octokit: new Octokit(),
  });

  expectType<string>(project.owner);
  expectType<number>(project.number);
  expectType<Octokit>(project.octokit);
  expectType<"Title">(project.fields.title);
  expectType<"Status">(project.fields.status);
}

export function constructorWithCustomFieldsTest() {
  const project = new GitHubProject({
    owner: "owner",
    number: 1,
    octokit: new Octokit(),
    fields: {
      priority: "Priority",
    },
  });

  expectType<string>(project.owner);
  expectType<number>(project.number);
  expectType<Octokit>(project.octokit);
  expectType<"Title">(project.fields.title);
  expectType<"Status">(project.fields.status);
  expectType<string>(project.fields.priority);
}

export function constructorWithCustomOptionalFieldsTest() {
  const project = new GitHubProject({
    owner: "owner",
    number: 1,
    octokit: new Octokit(),
    fields: {
      priority: { name: "Priority", optional: true },
      targetDate: "Target Date",
    },
  });

  expectType<string>(project.owner);
  expectType<number>(project.number);
  expectType<Octokit>(project.octokit);
  expectType<"Title">(project.fields.title);
  expectType<"Status">(project.fields.status);
  expectType<string>(project.fields.priority.name);
  expectType<true>(project.fields.priority.optional);
  expectType<string>(project.fields.targetDate);
}

export function constructorWithTokenTest() {
  const project = new GitHubProject({
    owner: "owner",
    number: 1,
    token: "gpg_secret123",
  });

  expectType<string>(project.owner);
  expectType<number>(project.number);
  expectType<Octokit>(project.octokit);
}

export function gettersTest() {
  const project = new GitHubProject({
    owner: "owner",
    number: 1,
    token: "gpg_secret123",
  });

  // @ts-expect-error - `.owner` is a getter
  project.owner = "owner";
  // @ts-expect-error - `.number` is a getter
  project.number = 2;
  // @ts-expect-error - `.octokit` is a getter
  project.octokit = new Octokit();
  // @ts-expect-error - `.fields` is a getter
  project.fields = {};
}

export async function listItemsTest() {
  const project = new GitHubProject({
    owner: "owner",
    number: 1,
    token: "gpg_secret123",
  });
  const [item] = await project.items.list();

  if (item.type === "DRAFT_ISSUE") {
    expectType<string>(item.id);
    expectType<string | null>(item.fields.title);
    expectNotType<"Title">(item.fields.title);

    expectType<string>(item.content.id);
  } else if (item.type === "REDACTED") {
    expectType<string>(item.id);
    expectType<string | null>(item.fields.title);
    expectNotType<"Title">(item.fields.title);

    // @ts-expect-error - `.content` has no properties
    item.content.id;
  } else {
    expectType<string>(item.id);
    expectType<string | null>(item.fields.title);
    expectNotType<"Title">(item.fields.title);

    expectType<number>(item.content.number);

    if (item.type === "PULL_REQUEST") {
      expectType<boolean>(item.content.merged);
    }
  }
}

export async function addDraftItemTest() {
  const project = new GitHubProject({
    owner: "owner",
    number: 1,
    token: "gpg_secret123",
  });
  const item = await project.items.addDraft({ title: "Draft Item Title" });

  expectType<string>(item.id);
  expectType<"DRAFT_ISSUE">(item.type);
  expectType<string | null>(item.fields.title);
  expectNotType<"Title">(item.fields.title);

  expectType<string>(item.content.id);
}

export async function addItemTest() {
  const project = new GitHubProject({
    owner: "owner",
    number: 1,
    token: "gpg_secret123",
  });
  const item = await project.items.add("issue node_id");

  expectType<string>(item.id);
  expectNotType<"DRAFT_ISSUE">(item.type);
  expectType<string | null>(item.fields.title);
  expectNotType<"Title">(item.fields.title);

  expectType<number>(item.content.number);
}

export async function addItemWithFieldsTest() {
  const project = new GitHubProject({
    owner: "owner",
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
  expectNotType<"DRAFT_ISSUE">(item.type);
  expectType<string | null>(item.fields.title);
  expectNotType<"Title">(item.fields.title);
  expectType<string | null>(item.fields.myField);

  // @ts-expect-error - Property 'otherField' does not exist on type '{ myField: string | null; title: string | null; status: string | null; }'
  item.fields.otherField;

  expectType<number>(item.content.number);
}

export async function addItemTestWithOptionalField() {
  const project = new GitHubProject({
    owner: "owner",
    number: 1,
    token: "gpg_secret123",
    fields: {
      foo: "bar",
      myField: { name: "My Field", optional: true },
    },
  });
  const item = await project.items.add("issue node_id", {
    foo: "bar",
    myField: "my value",
  });

  if (item.fields.myField !== null) {
    // @ts-expect-error - `myField` is optional and may not be set
    item.fields.myField.toString();
  }
}

export async function getItemTest() {
  const project = new GitHubProject({
    owner: "owner",
    number: 1,
    token: "gpg_secret123",
    fields: {
      myField: "My Field",
    },
  });
  const item = await project.items.get("item node id");

  if (typeof item === "undefined") {
    expectType<undefined>(item);
    return;
  }

  if (item.type === "DRAFT_ISSUE") {
    expectType<string>(item.id);
    expectType<string | null>(item.fields.title);
    expectNotType<"Title">(item.fields.title);
    expectType<string | null>(item.fields.myField);

    // @ts-expect-error any Property 'notField' does not exist on type
    item.fields.notField;

    expectType<string>(item.content.id);
  } else if (item.type === "REDACTED") {
    expectType<string>(item.id);
    expectType<string | null>(item.fields.title);
    expectNotType<"Title">(item.fields.title);
    expectType<string | null>(item.fields.myField);

    // @ts-expect-error any Property 'notField' does not exist on type
    item.fields.notField;

    // @ts-expect-error - `.content` has no properties
    item.content.id;
  } else {
    expectType<string>(item.id);
    expectType<string | null>(item.fields.title);
    expectNotType<"Title">(item.fields.title);
    expectType<string | null>(item.fields.myField);

    expectType<number>(item.content.number);
  }
}

export async function getItemByContentIdTest() {
  const project = new GitHubProject({
    owner: "owner",
    number: 1,
    token: "gpg_secret123",
    fields: {
      myField: "My Field",
    },
  });
  const item = await project.items.getByContentId("content node id");

  if (typeof item === "undefined") {
    expectType<undefined>(item);
    return;
  }

  if (item.type === "DRAFT_ISSUE") {
    expectType<string>(item.id);
    expectType<string | null>(item.fields.title);
    expectNotType<"Title">(item.fields.title);
    expectType<string | null>(item.fields.myField);

    // @ts-expect-error any Property 'notField' does not exist on type
    item.fields.notField;

    expectType<string>(item.content.id);
  } else if (item.type === "REDACTED") {
    expectType<string>(item.id);
    expectType<string | null>(item.fields.title);
    expectNotType<"Title">(item.fields.title);
    expectType<string | null>(item.fields.myField);

    // @ts-expect-error any Property 'notField' does not exist on type
    item.fields.notField;

    // @ts-expect-error - `.content` has no properties
    item.content.id;
  } else {
    expectType<string>(item.id);
    expectType<string | null>(item.fields.title);
    expectNotType<"Title">(item.fields.title);
    expectType<string | null>(item.fields.myField);

    expectType<number>(item.content.number);
  }
}

export async function getItemByRepositoryAndNumberTest() {
  const project = new GitHubProject({
    owner: "owner",
    number: 1,
    token: "gpg_secret123",
    fields: {
      myField: "My Field",
    },
  });
  const item = await project.items.getByContentRepositoryAndNumber(
    "repository-name",
    1,
  );

  if (typeof item === "undefined") {
    expectType<undefined>(item);
    return;
  }

  if (item.type === "DRAFT_ISSUE") {
    expectType<string>(item.id);
    expectType<string | null>(item.fields.title);
    expectNotType<"Title">(item.fields.title);
    expectType<string | null>(item.fields.myField);

    // @ts-expect-error any Property 'notField' does not exist on type
    item.fields.notField;

    expectType<string>(item.content.id);
  } else if (item.type === "REDACTED") {
    expectType<string>(item.id);
    expectType<string | null>(item.fields.title);
    expectNotType<"Title">(item.fields.title);
    expectType<string | null>(item.fields.myField);

    // @ts-expect-error any Property 'notField' does not exist on type
    item.fields.notField;

    // @ts-expect-error - `.content` has no properties
    item.content.id;
  } else {
    expectType<string>(item.id);
    expectType<string | null>(item.fields.title);
    expectNotType<"Title">(item.fields.title);
    expectType<string | null>(item.fields.myField);

    expectType<number>(item.content.number);
  }
}

export async function updateItemTest() {
  const project = new GitHubProject({
    owner: "owner",
    number: 1,
    token: "gpg_secret123",
    fields: {
      myField: "My Field",
    },
  });
  const item = await project.items.update("item node it", {
    status: "new status",
  });

  if (typeof item === "undefined") {
    expectType<undefined>(item);
    return;
  }

  if (item.type === "DRAFT_ISSUE") {
    expectType<string>(item.id);
    expectType<string | null>(item.fields.title);
    expectNotType<"Title">(item.fields.title);
    expectType<string | null>(item.fields.myField);

    // @ts-expect-error any Property 'notField' does not exist on type
    item.fields.notField;

    expectType<string>(item.content.id);
  } else if (item.type === "REDACTED") {
    expectType<string>(item.id);
    expectType<string | null>(item.fields.title);
    expectNotType<"Title">(item.fields.title);
    expectType<string | null>(item.fields.myField);

    // @ts-expect-error any Property 'notField' does not exist on type
    item.fields.notField;

    // @ts-expect-error - `.content` has no properties
    item.content.id;
  } else {
    expectType<string>(item.id);
    expectType<string | null>(item.fields.title);
    expectNotType<"Title">(item.fields.title);
    expectType<string | null>(item.fields.myField);

    expectType<number>(item.content.number);
  }
}

export async function updateItemByContentIdTest() {
  const project = new GitHubProject({
    owner: "owner",
    number: 1,
    token: "gpg_secret123",
    fields: {
      myField: "My Field",
    },
  });
  const item = await project.items.updateByContentId("issue node id", {
    status: "new status",
  });

  if (typeof item === "undefined") {
    expectType<undefined>(item);
    return;
  }

  if (item.type === "DRAFT_ISSUE") {
    expectType<string>(item.id);
    expectType<string | null>(item.fields.title);
    expectNotType<"Title">(item.fields.title);
    expectType<string | null>(item.fields.myField);

    // @ts-expect-error any Property 'notField' does not exist on type
    item.fields.notField;

    expectType<string>(item.content.id);
  } else if (item.type === "REDACTED") {
    expectType<string>(item.id);
    expectType<string | null>(item.fields.title);
    expectNotType<"Title">(item.fields.title);
    expectType<string | null>(item.fields.myField);

    // @ts-expect-error any Property 'notField' does not exist on type
    item.fields.notField;

    // @ts-expect-error - `.content` has no properties
    item.content.id;
  } else {
    expectType<string>(item.id);
    expectType<string | null>(item.fields.title);
    expectNotType<"Title">(item.fields.title);
    expectType<string | null>(item.fields.myField);

    expectType<number>(item.content.number);
  }
}

export async function updateItemByContentRepositoryAndNumberTest() {
  const project = new GitHubProject({
    owner: "owner",
    number: 1,
    token: "gpg_secret123",
    fields: {
      myField: "My Field",
    },
  });
  const item = await project.items.updateByContentRepositoryAndNumber(
    "repository-name",
    1,
    {
      status: "new status",
    },
  );

  if (typeof item === "undefined") {
    expectType<undefined>(item);
    return;
  }

  if (item.type === "DRAFT_ISSUE") {
    expectType<string>(item.id);
    expectType<string | null>(item.fields.title);
    expectNotType<"Title">(item.fields.title);
    expectType<string | null>(item.fields.myField);

    // @ts-expect-error any Property 'notField' does not exist on type
    item.fields.notField;

    expectType<string>(item.content.id);
  } else if (item.type === "REDACTED") {
    expectType<string>(item.id);
    expectType<string | null>(item.fields.title);
    expectNotType<"Title">(item.fields.title);
    expectType<string | null>(item.fields.myField);

    // @ts-expect-error any Property 'notField' does not exist on type
    item.fields.notField;

    // @ts-expect-error - `.content` has no properties
    item.content.id;
  } else {
    expectType<string>(item.id);
    expectType<string | null>(item.fields.title);
    expectNotType<"Title">(item.fields.title);
    expectType<string | null>(item.fields.myField);

    expectType<number>(item.content.number);
  }
}

export async function archiveItemTest() {
  const project = new GitHubProject({
    owner: "owner",
    number: 1,
    token: "gpg_secret123",
  });
  const item = await project.items.archive("item node id");

  if (typeof item === "undefined") {
    expectType<undefined>(item);
    return;
  }

  expectType<string>(item.id);
}

export async function archiveItemByContentIdTest() {
  const project = new GitHubProject({
    owner: "owner",
    number: 1,
    token: "gpg_secret123",
  });
  const item = await project.items.archiveByContentId("content node id");

  if (typeof item === "undefined") {
    expectType<undefined>(item);
    return;
  }

  expectType<string>(item.id);
}

export async function archiveItemByContentRepositoryAndNameTest() {
  const project = new GitHubProject({
    owner: "owner",
    number: 1,
    token: "gpg_secret123",
  });
  const item = await project.items.archiveByContentRepositoryAndNumber(
    "repository-name",
    1,
  );

  if (typeof item === "undefined") {
    expectType<undefined>(item);
    return;
  }

  expectType<string>(item.id);
}

export async function removeItemTest() {
  const project = new GitHubProject({
    owner: "owner",
    number: 1,
    token: "gpg_secret123",
  });
  const item = await project.items.remove("item node id");

  if (typeof item === "undefined") {
    expectType<undefined>(item);
    return;
  }

  expectType<string>(item.id);
}

export async function removeItemByContentIdTest() {
  const project = new GitHubProject({
    owner: "owner",
    number: 1,
    token: "gpg_secret123",
  });
  const item = await project.items.removeByContentId("content node id");

  if (typeof item === "undefined") {
    expectType<undefined>(item);
    return;
  }

  expectType<string>(item.id);
}

export async function removeItemByContentRepositoryAndNameTest() {
  const project = new GitHubProject({
    owner: "owner",
    number: 1,
    token: "gpg_secret123",
  });
  const item = await project.items.removeByContentRepositoryAndNumber(
    "repository-name",
    1,
  );

  if (typeof item === "undefined") {
    expectType<undefined>(item);
    return;
  }

  expectType<string>(item.id);
}

export async function matchFieldNameOption() {
  new GitHubProject({
    owner: "owner",
    number: 1,
    token: "gpg_secret123",
    matchFieldName(projectFieldName, userFieldName) {
      return projectFieldName === userFieldName;
    },
  });
}

export async function testGetInstance() {
  const project = await GitHubProject.getInstance({
    owner: "owner",
    number: 1,
    token: "gpg_secret123",
    fields: {
      myField: "My Field",
    },
  });

  expectType<GitHubProject<{ myField: string }>>(project);
  expectType<string>(project.fields.myField);

  const items = await project.items.list();
  expectType<string | null>(items[0].fields.myField);
}

export async function testGetProperties() {
  const project = new GitHubProject({
    owner: "owner",
    number: 1,
    token: "gpg_secret123",
  });

  const properties = await project.getProperties();

  expectType<{
    databaseId: string;
    id: string;
    title: string;
    url: string;
  }>(properties);
}

export function testGitHubProjectError() {
  const error = new GitHubProjectError();

  // setting type for GitHubProjectError.name is causing a type error, see comment in index.d.ts
  // expectType<"GitHubProjectError">(error.name);
  expectType<{}>(error.details);
  expectType<string>(error.toHumanError());
}

export function testGitHubProjectUnknownFieldError() {
  const details = {
    projectFieldNames: ["one", "two"],
    userFieldName: "Three",
    userInternalFieldName: "three",
  };
  const error = new GitHubProjectUnknownFieldError(details);

  expectType<"GitHubProjectUnknownFieldError">(error.name);
  expectType<typeof details>(error.details);
  expectType<string>(error.toHumanError());
}

export function testGitHubProjectUnknownFieldOptionError() {
  const details = {
    field: {
      id: "field id",
      name: "field name",
      options: [
        {
          id: "option id",
          name: "option name",
        },
      ],
    },
    userValue: "user value",
  };
  const error = new GitHubProjectUnknownFieldOptionError(details);

  expectType<"GitHubProjectUnknownFieldOptionError">(error.name);
  expectType<typeof details>(error.details);
  expectType<string>(error.toHumanError());
}
