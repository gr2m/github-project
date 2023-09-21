// @ts-check

export class GitHubProjectError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.details = {};
  }
  /* c8 ignore start */
  toHumanMessage() {
    return this.message;
  }
  /* c8 ignore stop */
}

export class GitHubProjectUnknownFieldError extends GitHubProjectError {
  constructor(details) {
    super("Project field cannot be found");
    this.details = details;
  }

  toHumanMessage() {
    const projectFieldNames = this.details.projectFieldNames
      .map((node) => `"${node.name}"`)
      .join(", ");
    return `"${this.details.userFieldName}" could not be matched with any of the existing field names: ${projectFieldNames}. If the field should be considered optional, then set it to "${this.details.userInternalFieldName}: { name: "${this.details.userFieldName}", optional: true}`;
  }
}

export class GitHubProjectUnknownFieldOptionError extends GitHubProjectError {
  constructor(details) {
    super("Project field option cannot be found");
    this.details = details;
  }

  toHumanMessage() {
    const existingOptionsString = this.details.field.options
      .map((option) => `"${option.name}"`)
      .join(", ");

    return `"${this.details.userValue}" is an invalid option for "${this.details.field.name}".\n\nKnown options are:\n${existingOptionsString}`;
  }
}

export class GitHubProjectUpdateReadOnlyFieldError extends GitHubProjectError {
  constructor(details) {
    super("Project read-only field cannot be updated");
    this.details = details;
  }

  toHumanMessage() {
    return `Cannot update read-only fields: ${this.details.fields
      .map(({ userValue, userName }) => `"${userValue}" (.${userName})`)
      .join(", ")}`;
  }
}
