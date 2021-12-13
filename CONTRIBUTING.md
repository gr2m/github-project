# Contributing

Thank you for considering to contribute to `github-project` 💖

Please note that this project is released with a [Contributor Code of Conduct][./code_of_conduct.md].
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

## Issues before pull requests

Unless the change is trivial such as a type, please [open an issue first](https://github.com/gr2m/github-project/issues/new) before starting a pull request for a bug fix or a new feature.

After you cloned your fork, create a new branch and implement the changes in them. To start a pull request, you can use the `gh` CLI

```
gh pr create
```

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
