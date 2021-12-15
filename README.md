# github-project

> JavaScript SDK for GitHub's new Projects

[![Test](https://github.com/gr2m/github-project/actions/workflows/test.yml/badge.svg)](https://github.com/gr2m/github-project/actions/workflows/test.yml)

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

A project always belongs to an organization and has a number. For authentication you can pass [a personal access token with the `write:org` scope](https://github.com/settings/tokens/new?scopes=write:org&description=github-project). For read-only access the `read:org` scope is sufficient.

`fields` is map of internal field names to the project's column labels.

```js
const project = new GitHubProject({
  org: "my-org",
  number: 1,
  token: "ghp_s3cR3t",
  fields: {
    priority: "Priority",
    dueAt: "Due",
  },
});

// log out all items
const items = await project.items.list();
for (const item of items) {
  // every item has a `.fields` property for the custome fields
  // and an `.issueOrPullRequest` property which is set unless the item is a draft
  console.log(
    "%s is due on %s (Priority: %d, Assignees: %j)",
    item.fields.title,
    item.fields.dueAt,
    item.fields.priority,
    item.issueOrPullRequest?.assignees.map(({ login }) => login).join(",") ||
      "_draft_"
  );
}

// add a new item using an existing issue
// You would usually retriev the issue node ID from an event payload, such as `event.issue.node_id`
const newItem = await project.items.add(issue.node_id, { priority: 1 });

// retrieve a single item using the issue node ID (item node ID works, too)
const item = await project.items.get(issue.node_id);

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
        <code>options.org</code>
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

A map of internal names for fields to the column names. By default, the colum names for all custom fields are used for both keys and values. The `title` key will always be set to `"Title"` and `status` to `"Status"` to account for the built-in fields. The other built-in columns `Assignees`, `Labels`, `Milestone`, and `Repository` cannot be set through the project and are not considered fields. You have to set them on the issue or pull request, and you can access them by `item.issueOrPullRequest.assignees`, `item.issueOrPullRequest.labels` etc (for both issues and pull requests).

</td>
    </tr>
  </tbody>
</table>

### `project.items.list()`

```js
const items = await project.items.list();
```

Returns the first 100 items of the project.

### `project.items.add()`

```js
const newItem = await project.items.add(issueNodeId /*, fields*/);
```

Adds a new item to the project, sets the fields if any were passed, and returns the new item. If the item already exists then it's a no-op, the existing item is still updated with the passed fields if any were passed.

Note: GitHub has currently no API to add a draft issue to a project.

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
        <code>issueNodeId</code>
      </th>
      <td>
        <code>string<code>
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
        <code>object<code>
      </td>
      <td>

Map of internal field names to their values.

</td>
    </tr>
  </tbody>
</table>

### `project.items.get()`

```js
const item = await project.items.get(nodeId);
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
        <code>nodeId</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

**Required**. The graphql node ID of the project item or issue/pull request.

</td>
    </tr>
  </tbody>
</table>

### `project.items.update()`

```js
const updatedItem = await project.items.update(nodeId, fields);
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
        <code>nodeId</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

**Required**. The graphql node ID of the project item or issue/pull request.

</td>
    </tr>
    <tr>
      <th>
        <code>fields</code>
      </th>
      <td>
        <code>object<code>
      </td>
      <td>

Map of internal field names to their values.

</td>
    </tr>
  </tbody>
</table>

### `project.items.remove()`

```js
await project.items.remove(nodeId);
```

Removes a single item. Resolves with `undefined`, no matter if item was found or not.

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
        <code>nodeId</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

**Required**. The graphql node ID of the project item or issue/pull request.

</td>
    </tr>
  </tbody>
</table>

## License

[ISC](LICENSE.md)
