// @ts-check

export class GitHubProjectError extends Error {
  constructor(message) {
    super(message);
    this.name = "GitHubProjectError";
    this.details = {};
  }
  toHumanError() {
    return this.message;
  }
}

export class GitHubProjectUnknownFieldError extends GitHubProjectError {
  constructor(details) {
    super("Project field cannot be found");
    this.name = "GitHubProjectUnknownFieldError";
    this.details = details;
  }

  toHumanError() {
    const projectFieldNames = this.details.projectFieldNames
      .map((node) => `"${node.name}"`)
      .join(", ");
    return `"${this.details.userFieldName}" could not be matched with any of the existing field names: ${projectFieldNames}. If the field should be considered optional, then set it to "${this.details.userInternalFieldName}: { name: "${this.details.userFieldName}", optional: true}`;
  }
}

export class GitHubProjectUnknownFieldOptionError extends GitHubProjectError {
  constructor(details) {
    super("Project field cannot be found");
    this.name = "GitHubProjectUnknownFieldOptionError";
    this.details = details;
  }

  toHumanError() {
    const existingOptionsString = this.details.field.options
      .map((option) => `"${option.name}"`)
      .join(", ");

    return `"${this.details.userValue}" is an invalid option for "${this.details.field.name}".\n\nKnown options are:\n${existingOptionsString}`;
  }
}

export class GitHubProjectUpdateReadOnlyFieldError extends GitHubProjectError {
  constructor(details) {
    super("Project field cannot be found");
    this.name = "GitHubProjectUpdateReadOnlyFieldError";
    this.details = details;
  }

  toHumanError() {
    return `[github-project] Cannot update read-only fields: ${this.details.fields
      .map(({ userValue, userName }) => `"${userValue}" (.${userName})`)
      .join(", ")}`;
  }
}
