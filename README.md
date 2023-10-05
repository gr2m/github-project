# github-project

> JavaScript SDK for GitHub's new Projects

[![Test](https://github.com/gr2m/github-project/actions/workflows/test.yml/badge.svg)](https://github.com/gr2m/github-project/actions/workflows/test.yml)

## Features

- Use [GitHub Projects (beta)](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects) as a database of issues and pull requests with custom fields.
- Simple interaction with item fields and content (draft/issue/pull request) properties.
- Look up items by issue/pull request node IDs or number and repository name.
- 100% test coverage and type definitions.

## Usage

<table>
<tbody valign=top align=left>
<tr><th>
Browsers
</th><td width=100%>
Load <code>github-project</code> directly from <a href="https://cdn.skypack.dev">cdn.skypack.dev</a>

```html
<script type="module">
  import GitHubProject from "https://cdn.skypack.dev/github-project";
</script>
```

</td></tr>
<tr><th>
Node
</th><td>

Install with <code>npm install github-project</code>

```js
import GitHubProject from "github-project";
```

</td></tr>
</tbody>
</table>

A project always belongs to a user or organization account and has a number. For authentication you can pass [a personal access token with `project` and `write:org` scopes](https://github.com/settings/tokens/new?scopes=write:org,project&description=github-project). For read-only access the `read:org` and `read:project` scopes are sufficient.

`fields` is map of internal field names to the project's column labels. The comparison is case-insensitive. `"Priority"` will match both a field with the label `"Priority"` and one with the label `"priority"`. An error will be thrown if a project field isn't found, unless the field is set to `optional: true`.

```js
const options = {
  owner: "my-org",
  number: 1,
  token: "ghp_s3cR3t",
  fields: {
    priority: "Priority",
    dueAt: "Due",
    lastUpdate: { name: "Last Update", optional: true },
  },
};

const project = new GitHubProject(options);

// Alternatively, you can call the factory method to get a project instance
// const project = await GithubProject.getInstance(options)

// get project data
const projectData = await project.get();
console.log(projectData.description);

// log out all items
const items = await project.items.list();
for (const item of items) {
  // every item has a `.fields` property for the custom fields
  // and an `.content` property which is set unless the item is a draft
  console.log(
    "%s is due on %s (Priority: %d, Assignees: %j)",
    item.fields.title,
    item.fields.dueAt,
    item.fields.priority,
    item.type === "REDACTED"
      ? "_redacted_"
      : item.content.assignees.map(({ login }) => login).join(","),
  );
}

// add a new item using an existing issue
// You would usually retrieve the issue node ID from an event payload, such as `event.issue.node_id`
const newItem = await project.items.add(issue.node_id, { priority: 1 });

// retrieve a single item using the issue node ID (passing item node ID as string works, too)
const item = await project.items.getByContentId(issue.node_id);

// item is undefined when not found
if (item) {
  // update an item
  const updatedItem = await project.items.update(item.id, { priority: 2 });

  // remove item
  await project.items.remove(item.id);
}
```

## API

### Constructor

```js
const project = new GitHubProject(options);
```

### Factory method

The factory method is useful when you want immediate access to the project's data, for example to get the project's title. Will throw an error if the project doesn't exist.

```js
const project = GitHubProject.getInstance(options);
```

<table>
  <thead align=left>
    <tr>
      <th>
        name
      </th>
      <th>
        type
      </th>
      <th width=100%>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>options.owner</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

**Required**. The account name of the GitHub organization.

</td>
    </tr>
    <tr>
      <th>
        <code>options.number</code>
      </th>
      <td>
        <code>Number</code>
      </td>
      <td>

**Required**. Project number as you see it in the URL of the project.

</td>
    </tr>
    <tr>
      <th>
        <code>options.token</code>
      </th>
      <td>
        <code>String</code>
      </td>
      <td>

**Required unless `options.octokit` is set**. When set to a personal access token or an OAuth token, the `read:org` scope is required for read-only access, and the `write:org` scope is required for read-write access. When set to an installation access token, the `organization_projects:read` permission is required for read-only access, and the `organization_projects:write` permission is required for read-write access.

</td></tr>
    <tr>
      <th>
        <code>options.octokit</code>
      </th>
      <td>
        <code>Octokit</code>
      </td>
      <td>

**Required unless `options.token` is set**. You can pass an [`@octokit/core`](https://github.com/octokit/core.js/#readme) instance, or an instance of any `Octokit` class that is built upon it, such as [`octokit`](https://github.com/octokit/octokit.js/#readme).

</td>
    </tr>
    <tr>
      <th>
        <code>options.fields</code>
      </th>
      <td>
        <code>Object</code>
      </td>
      <td>

**Required**. A map of internal names for fields to the column names or field option objects. The `title` key will always be set to `"Title"` and `status` to `"Status"` to account for the built-in fields. The other built-in columns `Assignees`, `Labels`, `Linked Pull Requests`, `Milestone`, `Repository`, and `Reviewers` cannot be set through the project and are not considered fields. You have to set them on the issue or pull request, and you can access them by `item.content.assignees`, `item.content.labels` etc (for both issues and pull requests).

A field option object must include a `name` key and can include an `optional` key.

When `optional` is `false` or omitted, an error will be thrown if the field is not found in the project. When `optional` is `true`, the error will be replaced by an `info` log via the [Octokit Logger](https://octokit.github.io/rest.js/v18#logging). Optional fields that don't exist in the project are not set on items returned by the `project.items.*` methods.

</td>
    </tr>
    <tr>
      <th>
        <code>options.matchFieldName</code>
      </th>
      <td>
        <code>Function</code>
      </td>
      <td>

Customize how field names are matched with the values provided in `options.fields`. The function accepts two arguments:

1. `projectFieldName`
2. `userFieldName`

Both are strings. Both arguments are lower-cased and trimmed before passed to the function. The function must return `true` or `false`.

Defaults to

```js
function (projectFieldName, userFieldName) {
  return projectFieldName === userFieldName
}
```

</td>
    </tr>
    <tr>
      <th>
        <code>options.matchFieldOptionValue</code>
      </th>
      <td>
        <code>Function</code>
      </td>
      <td>

Customize how field options are matched with the field values set in `project.items.add()`, `project.items.addDraft()`, or `project.items.update*()` methods. The function accepts two arguments:

1. `fieldOptionValue`
2. `userValue`

Both are strings. Both arguments are trimmed before passed to the function. The function must return `true` or `false`.

Defaults to

```js
function (fieldOptionValue, userValue) {
  return fieldOptionValue === userValue
}
```

</td>
    </tr>
    <tr>
      <th>
        <code>options.truncate</code>
      </th>
      <td>
        <code>Function</code>
      </td>
      <td>

Text field values cannot exceed 1024 characters. By default, the `options.truncate` just returns text as is. We recommend to use an establish truncate function such as [loadsh's `_.truncate()`](https://lodash.com/docs/4.17.15#truncate), as byte size is not the same as text length.

</td>
    </tr>
  </tbody>
</table>

### `project.getProperties()`

```js
const projectData = await project.getProperties();
```

Returns project level data `url`, `title`, `description` and `databaseId`

### `project.items.list()`

```js
const items = await project.items.list();
```

Returns the first 100 items of the project.

### `project.items.addDraft()`

```js
const newItem = await project.items.addDraft(content /*, fields*/);
```

Adds a new draft issue item to the project, sets the fields if any were passed, and returns the new item.

<table>
  <thead align=left>
    <tr>
      <th>
        name
      </th>
      <th>
        type
      </th>
      <th width=100%>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>content.title</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

**Required**. The title of the issue draft.

</td>
    </tr>
    <tr>
      <th>
        <code>content.body</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

The body of the issue draft.

</td>
    </tr>
    <tr>
      <th>
        <code>content.assigneeIds</code>
      </th>
      <td>
        <code>string[]</code>
      </td>
      <td>

Node IDs of user accounts the issue should be assigned to when created.

</td>
    </tr>
    <tr>
      <th>
        <code>fields</code>
      </th>
      <td>
        <code>object</code>
      </td>
      <td>

Map of internal field names to their values.

</td>
    </tr>
  </tbody>
</table>

### `project.items.add()`

```js
const newItem = await project.items.add(contentId /*, fields*/);
```

Adds a new item to the project, sets the fields if any were passed, and returns the new item. If the item already exists then it's a no-op, the existing item is still updated with the passed fields if any were passed.

<table>
  <thead align=left>
    <tr>
      <th>
        name
      </th>
      <th>
        type
      </th>
      <th width=100%>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>contentId</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

**Required**. The graphql node ID of the issue or pull request you want to add.

</td>
    </tr>
    <tr>
      <th>
        <code>fields</code>
      </th>
      <td>
        <code>object</code>
      </td>
      <td>

Map of internal field names to their values.

</td>
    </tr>
  </tbody>
</table>

### `project.items.get()`

```js
const item = await project.items.get(itemNodeId);
```

Retrieve a single item based on its issue or pull request node ID.
Resolves with `undefined` if item cannot be found.

<table>
  <thead align=left>
    <tr>
      <th>
        name
      </th>
      <th>
        type
      </th>
      <th width=100%>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>itemNodeId</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

**Required**. The graphql node ID of the project item

</td>
    </tr>
  </tbody>
</table>

### `project.items.getByContentId()`

```js
const item = await project.items.getByContentId(contentId);
```

Retrieve a single item based on its issue or pull request node ID.
Resolves with `undefined` if item cannot be found.

<table>
  <thead align=left>
    <tr>
      <th>
        name
      </th>
      <th>
        type
      </th>
      <th width=100%>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>contentId</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

**Required**. The graphql node ID of the issue/pull request the item is linked to.

</td>
    </tr>
  </tbody>
</table>

### `project.items.getByContentRepositoryAndNumber()`

```js
const item = await project.items.getByContentRepositoryAndNumber(
  repositoryName,
  issueOrPullRequestNumber,
);
```

Retrieve a single item based on its issue or pull request node ID.
Resolves with `undefined` if item cannot be found.

<table>
  <thead align=left>
    <tr>
      <th>
        name
      </th>
      <th>
        type
      </th>
      <th width=100%>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>repositoryName</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

**Required**. The repository name, without the `owner/`.

</td>
    </tr>
    <tr>
      <th>
        <code>issueOrPullRequestNumber</code>
      </th>
      <td>
        <code>number</code>
      </td>
      <td>

**Required**. The number of the issue or pull request.

</td>
    </tr>
  </tbody>
</table>

### `project.items.update()`

```js
const updatedItem = await project.items.update(itemNodeId, fields);
```

Update an exist item. To unset a field, set it to `null`.
Returns undefined if item cannot be found.

<table>
  <thead align=left>
    <tr>
      <th>
        name
      </th>
      <th>
        type
      </th>
      <th width=100%>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>itemNodeId</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

**Required**. The graphql node ID of the project item

</td>
    </tr>
    <tr>
      <th>
        <code>fields</code>
      </th>
      <td>
        <code>object</code>
      </td>
      <td>

Map of internal field names to their values.

</td>
    </tr>
  </tbody>
</table>

### `project.items.updateByContentId()`

```js
const updatedItem = await project.items.updateByContentId(contentId, fields);
```

Update an exist item based on the node ID of its linked issue or pull request. To unset a field, set it to `null`.
Returns undefined if item cannot be found.

<table>
  <thead align=left>
    <tr>
      <th>
        name
      </th>
      <th>
        type
      </th>
      <th width=100%>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>contentId</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

**Required**. The graphql node ID of the issue/pull request the item is linked to.

</td>
    </tr>
    <tr>
      <th>
        <code>fields</code>
      </th>
      <td>
        <code>object</code>
      </td>
      <td>

Map of internal field names to their values.

</td>
    </tr>
  </tbody>
</table>

### `project.items.updateByContentRepositoryAndNumber()`

```js
const updatedItem = await project.items.updateByContentRepositoryAndNumber(
  repositoryName,
  issueOrPullRequestNumber
  fields
);
```

Update an exist item based on the node ID of its linked issue or pull request. To unset a field, set it to `null`.
Returns undefined if item cannot be found.

<table>
  <thead align=left>
    <tr>
      <th>
        name
      </th>
      <th>
        type
      </th>
      <th width=100%>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>repositoryName</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

**Required**. The repository name, without the `owner/`.

</td>
    </tr>
    <tr>
      <th>
        <code>issueOrPullRequestNumber</code>
      </th>
      <td>
        <code>number</code>
      </td>
      <td>

**Required**. The number of the issue or pull request.

</td>
    </tr>
    <tr>
      <th>
        <code>fields</code>
      </th>
      <td>
        <code>object</code>
      </td>
      <td>

Map of internal field names to their values.

</td>
    </tr>
  </tbody>
</table>

### `project.items.archive()`

```js
await project.items.archive(itemNodeId);
```

Archives a single item. Resolves with the archived item or with `undefined` if item was not found.

<table>
  <thead align=left>
    <tr>
      <th>
        name
      </th>
      <th>
        type
      </th>
      <th width=100%>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>itemNodeId</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

**Required**. The graphql node ID of the project item

</td>
    </tr>
  </tbody>
</table>

### `project.items.archiveByContentId()`

```js
await project.items.archiveByContentId(contentId);
```

Archives a single item based on the Node ID of its linked issue or pull request. Resolves with the archived item or with `undefined` if item was not found.

<table>
  <thead align=left>
    <tr>
      <th>
        name
      </th>
      <th>
        type
      </th>
      <th width=100%>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>contentId</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

**Required**. The graphql node ID of the issue/pull request the item is linked to.

</td>
    </tr>
  </tbody>
</table>

### `project.items.archiveByContentRepositoryAndNumber()`

```js
await project.items.archiveByContentRepositoryAndNumber(
  repositoryName,
  issueOrPullRequestNumber,
);
```

Archives a single item based on the Node ID of its linked issue or pull request. Resolves with the archived item or with `undefined` if item was not found.

<table>
  <thead align=left>
    <tr>
      <th>
        name
      </th>
      <th>
        type
      </th>
      <th width=100%>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>repositoryName</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

**Required**. The repository name, without the `owner/`.

</td>
    </tr>
    <tr>
      <th>
        <code>issueOrPullRequestNumber</code>
      </th>
      <td>
        <code>number</code>
      </td>
      <td>

**Required**. The number of the issue or pull request.

</td>
    </tr>
  </tbody>
</table>

### `project.items.remove()`

```js
await project.items.remove(itemNodeId);
```

Removes a single item. Resolves with the removed item or with `undefined` if item was not found.

<table>
  <thead align=left>
    <tr>
      <th>
        name
      </th>
      <th>
        type
      </th>
      <th width=100%>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>itemNodeId</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

**Required**. The graphql node ID of the project item

</td>
    </tr>
  </tbody>
</table>

### `project.items.removeByContentId()`

```js
await project.items.removeByContentId(contentId);
```

Removes a single item based on the Node ID of its linked issue or pull request. Resolves with the removed item or with `undefined` if item was not found.

<table>
  <thead align=left>
    <tr>
      <th>
        name
      </th>
      <th>
        type
      </th>
      <th width=100%>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>contentId</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

**Required**. The graphql node ID of the issue/pull request the item is linked to.

</td>
    </tr>
  </tbody>
</table>

### `project.items.removeByContentRepositoryAndNumber()`

```js
await project.items.removeByContentRepositoryAndNumber(
  repositoryName,
  issueOrPullRequestNumber,
);
```

Removes a single item based on the Node ID of its linked issue or pull request. Resolves with the removed item or with `undefined` if item was not found.

<table>
  <thead align=left>
    <tr>
      <th>
        name
      </th>
      <th>
        type
      </th>
      <th width=100%>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>repositoryName</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

**Required**. The repository name, without the `owner/`.

</td>
    </tr>
    <tr>
      <th>
        <code>issueOrPullRequestNumber</code>
      </th>
      <td>
        <code>number</code>
      </td>
      <td>

**Required**. The number of the issue or pull request.

</td>
    </tr>
  </tbody>
</table>

### Errors

Expected errors are thrown using custom `Error` classes. You can check for any error thrown by `github-project` or for specific errors.

Custom errors are designed in a way that `error.message` does not leak any user content. All errors do provide a `.toHumanMessage()` method if you want to provide a more helpful error message which includes both project data as well ase user-provided data.

```js
import Project, { GitHubProjectError } from "github-project";

try {
  await myScript(new Project(options));
} catch (error) {
  if (error instanceof GitHubProjectError) {
    myLogger.error(
      {
        // .code and .details are always set on GitHubProjectError instances
        code: error.code,
        details: error.details,
        // log out helpful human-readable error message, but beware that it likely contains user content
      },
      error.toHumanMessage(),
    );
  } else {
    // handle any other error
    myLogger.error({ error }, `An unexpected error occurred`);
  }

  throw error;
}
```

#### `GitHubProjectNotFoundError`

Thrown when a project cannot be found based on the `owner` and `number` passed to the `Project` constructor. The error is also thrown if the project exists but cannot be found based on authentication.

```js
import Project, { GitHubProjectNotFoundError } from "github-project";

try {
  await myScript(new Project(options));
} catch (error) {
  if (error instanceof GitHubProjectNotFoundError) {
    analytics.track("GitHubProjectNotFoundError", {
      owner: error.details.owner,
      number: error.details.number,
    });

    myLogger.error(
      {
        code: error.code,
        details: error.details,
      },
      error.toHumanMessage(),
    );
  }

  throw error;
}
```

<table>
  <thead align=left>
    <tr>
      <th>
        name
      </th>
      <th>
        type
      </th>
      <th width=100%>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>name</code>
      </th>
      <td>
        <code>constant</code>
      </td>
      <td><code>GitHubProjectNotFoundError</code></td>
    </tr>
    <tr>
      <th>
        <code>message</code>
      </th>
      <td>
        <code>constant</code>
      </td>
      <td>

> Project cannot be found

</td>
    <tr>
      <th>
        <code>details</code>
      </th>
      <td>
        <code>object</code>
      </td>
      <td>

Object with error details

</td>
    </tr>
    <tr>
      <th>
        <code>details.owner</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

Login of owner of the project

</td>
    </tr>
    <tr>
      <th>
        <code>details.number</code>
      </th>
      <td>
        <code>number</code>
      </td>
      <td>

Number of the project

</td>
    </tr>
  </tbody>
</table>

Example for `error.toHumanMessage()`:

> Project #1 could not be found for @gr2m

#### `GitHubProjectUnknownFieldError`

Thrown when a configured field configured in the `Project` constructor cannot be found in the project.

```js
import Project, { GitHubProjectUnknownFieldError } from "github-project";

try {
  await myScript(new Project(options));
} catch (error) {
  if (error instanceof GitHubProjectUnknownFieldError) {
    analytics.track("GitHubProjectUnknownFieldError", {
      projectFieldNames: error.details.projectFieldNames,
      userFieldName: error.details.userFieldName,
    });

    myLogger.error(
      {
        code: error.code,
        details: error.details,
      },
      error.toHumanMessage(),
    );
  }

  throw error;
}
```

<table>
  <thead align=left>
    <tr>
      <th>
        name
      </th>
      <th>
        type
      </th>
      <th width=100%>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>name</code>
      </th>
      <td>
        <code>constant</code>
      </td>
      <td><code>GitHubProjectUnknownFieldError</code></td>
    </tr>
    <tr>
      <th>
        <code>message</code>
      </th>
      <td>
        <code>constant</code>
      </td>
      <td>

> Project field cannot be found

</td>
    <tr>
      <th>
        <code>details</code>
      </th>
      <td>
        <code>object</code>
      </td>
      <td>

Object with error details

</td>
    </tr>
    <tr>
      <th>
        <code>details.projectFieldNames</code>
      </th>
      <td>
        <code>string[]</code>
      </td>
      <td>

Names of all project fields as shown in the project

</td>
    </tr>
    <tr>
      <th>
        <code>details.userFieldName</code>
      </th>
      <td>
        <code>object</code>
      </td>
      <td>

Name of the field provided by the user

</td>
    </tr>
    <tr>
      <th>
        <code>details.userFieldNameAlias</code>
      </th>
      <td>
        <code>object</code>
      </td>
      <td>

Alias of the field name provided by the user

</td>
    </tr>
  </tbody>
</table>

Example for `error.toHumanMessage()`:

> "NOPE" could not be matched with any of the existing field names: "My text", "My number", "My Date". If the field should be considered optional, then set it to "nope: { name: "NOPE", optional: true}

#### `GitHubProjectInvalidValueError`

Thrown when attempting to set a single select project field to a value that is not included in the field's configured options.

```js
import Project, { GitHubProjectInvalidValueError } from "github-project";

try {
  await myScript(new Project(options));
} catch (error) {
  if (error instanceof GitHubProjectInvalidValueError) {
    analytics.track("GitHubProjectInvalidValueError", {
      fieldName: error.details.field.name,
      userValue: error.details.userValue,
    });

    myLogger.error(
      {
        code: error.code,
        details: error.details,
      },
      error.toHumanMessage(),
    );
  }

  throw error;
}
```

<table>
  <thead align=left>
    <tr>
      <th>
        name
      </th>
      <th>
        type
      </th>
      <th width=100%>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>name</code>
      </th>
      <td>
        <code>constant</code>
      </td>
      <td><code>GitHubProjectInvalidValueError</code></td>
    </tr>
    <tr>
      <th>
        <code>message</code>
      </th>
      <td>
        <code>constant</code>
      </td>
      <td>

> User value is incompatible with project field type

</td>
    <tr>
      <th>
        <code>details</code>
      </th>
      <td>
        <code>object</code>
      </td>
      <td>

Object with error details

</td>
    </tr>
    <tr>
      <th>
        <code>details.field</code>
      </th>
      <td>
        <code>object</code>
      </td>
      <td>

Object with field details

</td>
    </tr>
    <tr>
      <th>
        <code>details.field.id</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

`details.field.id` is the project field GraphQL node ID

</td>
    </tr>
    <tr>
      <th>
        <code>details.field.name</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

The field name as shown in the project

</td>
    </tr>
    <tr>
      <th>
        <code>details.field.type</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

Is always either `DATE`, `NUMBER`, or `SINGLE_SELECT`. If it's `SINGLE_SELECT`, then the error is a [`GitHubProjectUnknownFieldOptionError`](#githubprojectunknownfieldoptionerror).

</td>
    </tr>
    <tr>
      <th>
        <code>details.userValue</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

The stringified value set in the API call.

</td>
    </tr>
  </tbody>
</table>

Example for `error.toHumanMessage()`:

> "unknown" is not compatible with the "My Date" project field

#### `GitHubProjectUnknownFieldOptionError`

Thrown when attempting to set a single select project field to a value that is not included in the field's configured options. Inherits from [`GitHubProjectInvalidValueError`](#githubprojectinvalidvalueerror).

```js
import Project, { GitHubProjectUnknownFieldOptionError } from "github-project";

try {
  await myScript(new Project(options));
} catch (error) {
  if (error instanceof GitHubProjectUnknownFieldOptionError) {
    analytics.track("GitHubProjectUnknownFieldOptionError", {
      fieldName: error.details.field.name,
      userValue: error.details.userValue,
    });

    myLogger.error(
      {
        code: error.code,
        details: error.details,
      },
      error.toHumanMessage(),
    );
  }

  throw error;
}
```

<table>
  <thead align=left>
    <tr>
      <th>
        name
      </th>
      <th>
        type
      </th>
      <th width=100%>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>name</code>
      </th>
      <td>
        <code>constant</code>
      </td>
      <td><code>GitHubProjectUnknownFieldOptionError</code></td>
    </tr>
    <tr>
      <th>
        <code>message</code>
      </th>
      <td>
        <code>constant</code>
      </td>
      <td>

> Project field option cannot be found

</td>
    <tr>
      <th>
        <code>details</code>
      </th>
      <td>
        <code>object</code>
      </td>
      <td>

Object with error details

</td>
    </tr>
    <tr>
      <th>
        <code>details.field</code>
      </th>
      <td>
        <code>object</code>
      </td>
      <td>

Object with field details

</td>
    </tr>
    <tr>
      <th>
        <code>details.field.id</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

`details.field.id` is the project field GraphQL node ID

</td>
    </tr>
    <tr>
      <th>
        <code>details.field.name</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

The field name as shown in the project

</td>
    </tr>
    <tr>
      <th>
        <code>details.field.type</code>
      </th>
      <td>
        <code>constant</code>
      </td>
      <td>

`SINGLE_SELECT`

</td>
    </tr>
    <tr>
      <th>
        <code>details.field.options</code>
      </th>
      <td>
        <code>object[]</code>
      </td>
      <td>

Array of objects with project field details

</td>
    </tr>
    <tr>
      <th>
        <code>details.field.options[].id</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

The GraphQL node ID of the option

</td>
    </tr>
    <tr>
      <th>
        <code>details.field.options[].name</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

The option name as shown in the project.

</td>
    </tr>
    <tr>
      <th>
        <code>details.userValue</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

The stringified value set in the API call.

</td>
    </tr>
  </tbody>
</table>

Example for `error.toHumanMessage()`:

> "unknown" is an invalid option for "Single select"

#### `GitHubProjectUpdateReadOnlyFieldError`

Thrown when attempting to set a single select project field to a value that is not included in the field's configured options.

```js
import Project, { GitHubProjectUpdateReadOnlyFieldError } from "github-project";

try {
  await myScript(new Project(options));
} catch (error) {
  if (error instanceof GitHubProjectUpdateReadOnlyFieldError) {
    analytics.track("GitHubProjectUpdateReadOnlyFieldError", {
      fieldName: error.details.field.name,
      userValue: error.details.userValue,
    });

    myLogger.error(
      {
        code: error.code,
        details: error.details,
      },
      error.toHumanMessage(),
    );
  }

  throw error;
}
```

<table>
  <thead align=left>
    <tr>
      <th>
        name
      </th>
      <th>
        type
      </th>
      <th width=100%>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>name</code>
      </th>
      <td>
        <code>constant</code>
      </td>
      <td><code>GitHubProjectUpdateReadOnlyFieldError</code></td>
    </tr>
    <tr>
      <th>
        <code>message</code>
      </th>
      <td>
        <code>constant</code>
      </td>
      <td>

> Project read-only field cannot be updated

</td>
    <tr>
      <th>
        <code>details</code>
      </th>
      <td>
        <code>object</code>
      </td>
      <td>

Object with error details

</td>
    </tr>
    <tr>
      <th>
        <code>details.fields</code>
      </th>
      <td>
        <code>object[]</code>
      </td>
      <td>

Array of objects with read-only fields and their user-provided values

</td>
    </tr>
    <tr>
      <th>
        <code>details.fields[].id</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

GraphQL node ID of the project field

</td>
    </tr>
    <tr>
      <th>
        <code>details.fields[].name</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

The project field name

</td>
    </tr>
    <tr>
      <th>
        <code>details.fields[].userName</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

The user-provided alias for the project field

</td>
    </tr>
    <tr>
      <th>
        <code>details.fields[].userValue</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

The user provided value that the user attempted to set the field to.

</td>
    </tr>
  </tbody>
</table>

Example for `error.toHumanMessage()`:

> Cannot update read-only fields: "Assignees" (.assignees) to "gr2m", "Labels" (.labels) to "bug"

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://dev.to/gr2m"><img src="https://avatars.githubusercontent.com/u/39992?v=4?s=100" width="100px;" alt="Gregor Martynus"/><br /><sub><b>Gregor Martynus</b></sub></a><br /><a href="#ideas-gr2m" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/gr2m/github-project/commits?author=gr2m" title="Code">💻</a> <a href="https://github.com/gr2m/github-project/commits?author=gr2m" title="Tests">⚠️</a> <a href="https://github.com/gr2m/github-project/pulls?q=is%3Apr+reviewed-by%3Agr2m" title="Reviewed Pull Requests">👀</a> <a href="#maintenance-gr2m" title="Maintenance">🚧</a> <a href="#infra-gr2m" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://mikesurowiec.com"><img src="https://avatars.githubusercontent.com/u/821435?v=4?s=100" width="100px;" alt="Mike Surowiec"/><br /><sub><b>Mike Surowiec</b></sub></a><br /><a href="https://github.com/gr2m/github-project/commits?author=mikesurowiec" title="Code">💻</a> <a href="https://github.com/gr2m/github-project/commits?author=mikesurowiec" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/tmelliottjr"><img src="https://avatars.githubusercontent.com/u/13594679?v=4?s=100" width="100px;" alt="Tom Elliott"/><br /><sub><b>Tom Elliott</b></sub></a><br /><a href="https://github.com/gr2m/github-project/commits?author=tmelliottjr" title="Code">💻</a> <a href="https://github.com/gr2m/github-project/commits?author=tmelliottjr" title="Tests">⚠️</a> <a href="https://github.com/gr2m/github-project/pulls?q=is%3Apr+reviewed-by%3Atmelliottjr" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://maxisam.github.io/"><img src="https://avatars.githubusercontent.com/u/456807?v=4?s=100" width="100px;" alt="Sam Lin"/><br /><sub><b>Sam Lin</b></sub></a><br /><a href="https://github.com/gr2m/github-project/commits?author=maxisam" title="Code">💻</a> <a href="https://github.com/gr2m/github-project/commits?author=maxisam" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://evan.bio"><img src="https://avatars.githubusercontent.com/u/17055832?v=4?s=100" width="100px;" alt="Evan Bonsignori"/><br /><sub><b>Evan Bonsignori</b></sub></a><br /><a href="https://github.com/gr2m/github-project/commits?author=Ebonsignori" title="Code">💻</a> <a href="https://github.com/gr2m/github-project/commits?author=Ebonsignori" title="Tests">⚠️</a> <a href="https://github.com/gr2m/github-project/commits?author=Ebonsignori" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## License

[ISC](LICENSE.md)
