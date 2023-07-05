# Contributing

Thank you for considering to contribute to `github-project` 💖

Please note that this project is released with a [Contributor Code of Conduct](./CODE_OF_CONDUCT.md).
By participating you agree to abide by its terms.

## Setup

Node.js 16 or higher is required. Install it from https://nodejs.org/en/. [GitHub's `gh` CLI](https://cli.github.com/) is recommended for the initial setup

1. Fork this repository and clone it to your local machine. Using `gh` you can do this

   ```
   gh repo fork gr2m/github-project
   ```

2. After cloning and changing into the `github-project` directory, install dependencies and run the tests

   ```
   npm install
   npm test
   ```

Few notes

- `npm test` runs all kind of tests. You can run the code tests in isolation with `npm run test:code`. Use `npm run` to see all available scripts.
- If coverage drops, run `npm run coverage` to open a coverage report in your browser.
- Make sure that update types in `index.d.ts` that reflect any features / fixes you might have implemented.

## Issues before pull requests

Unless the change is trivial such as a type, please [open an issue first](https://github.com/gr2m/github-project/issues/new) before starting a pull request for a bug fix or a new feature.

After you cloned your fork, create a new branch and implement the changes in them. To start a pull request, you can use the [`gh` CLI](https://cli.github.com/)

```
gh pr create
```

## Recording fixtures for testing

Most parts of `github-project` are tested using full integration tests, using fixtures for GraphQL requests and responses. You can see all the tests with their fixtures in [`test/recorded/`](test/recorded/).

If you changed how `github-project` is working or added a feature that is not covered by the existing tests, you need to update the fixtures.

We record the fixtures using a dedicated GitHub organization: [@github-project-fixtures](https://github.com/github-project-fixtures/). We can invite you to the organization so that you can record your own fixtures without setting up your own GitHub organization and app, just let us know.

But in case you prefer to use your own organization, you'll need to

1. Create your own organization on GitHub
2. Register a GitHub App for that organization with the following permissions
   - administration: 'write',
   - contents: 'write',
   - issues: 'write',
   - metadata: 'read',
   - organization_projects: 'admin',
   - pull_requests: 'write'

In either case, create a new project (beta) and add the following fields:

- Text (type: text)
- Number (type: number)
- Date (type: date)
- Single Select (type: single select) with options: "One", "Two", "Three"

Then copy the `.env.example` file to `.env` and fill in the values.

Then you can record fixtures for all tests in `test/recorded/*` using

```
node test/recorded/record-fixtures.js
```

If you only want to record fixtures for selected tests, pass the folder names as CLI arguments, e.g.

```
node test/recorded/record-fixtures.js api.items.add api.items.get
```

To test a single `test/recorded/*/test.js` file, run

```
# only test test/recorded/api.items.get/test.js
npx ava test/recorded.test.js --match api.items.get
```

If a test snapshot needs to be updated, run `ava` with `--update-snapshots`, e.g.

```
# update snapshot for test/recorded/api.items.get/test.js
npx ava test/recorded.test.js --match api.items.get --update-snapshots
```

To create a new test, copy an existing folder and delete the `fixtures.json` file in it. Update the `prepare.js` and `test.js` files to what's needed for your test. The `prepare.js` file is only used when recording fixtures using [`test/recorded/record-fixtures.js`](test/recorded/record-fixtures.js), this is where you create the state you need for your tests, e.g. create issues and add them as project items with custom properties. Any requests made in `prepare.js` are not part of the test fixtures.

When recording fixtures, all requests made in the `test.js` code are recorded and later replayed when running tests via [`test/recorded.test.js`](test/recorded.test.js).

The `project` instance passed to both the `test()` and `prepare()` functions is setting the default options. If you need a customized `project` instance for your test, you can do the following:

```js
// @ts-check

import GitHubProject from "../../../index.js";

/**
 * @param {import("../../..").default} defaultTestProject
 * @param {string} [contentId]
 */
export async function test(defaultTestProject, contentId = "I_1") {
  const project = new GitHubProject({
    owner: defaultTestProject.owner,
    number: defaultTestProject.number,
    octokit: defaultTestProject.octokit,
    fields: {
      ...defaultTestProject.fields,
      nonExistingField: { name: "Nope", optional: false },
    },
  });

  return project.items.getByContentId(contentId).then(
    () => new Error("should have thrown"),
    (error) => error,
  );
}
```

The above example also shows how to test for errors: simply return an error instance, without throwing it. That way it's tested with a snapshot, the same way as all the other tests.

## Maintainers only

### Merging the Pull Request & releasing a new version

Releases are automated using [semantic-release](https://github.com/semantic-release/semantic-release).
The following commit message conventions determine which version is released:

1. `fix: ...` or `fix(scope name): ...` prefix in subject: bumps fix version, e.g. `1.2.3` → `1.2.4`
2. `feat: ...` or `feat(scope name): ...` prefix in subject: bumps feature version, e.g. `1.2.3` → `1.3.0`
3. `BREAKING CHANGE:` in body: bumps breaking version, e.g. `1.2.3` → `2.0.0`

Only one version number is bumped at a time, the highest version change trumps the others.
Besides, publishing a new version to npm, semantic-release also creates a git tag and release
on GitHub, generates changelogs from the commit messages and puts them into the release notes.

If the pull request looks good but does not follow the commit conventions, update the pull request title and use the <kbd>Squash & merge</kbd> button, at which point you can set a custom commit message.
