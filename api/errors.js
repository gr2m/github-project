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

export class GitHubProjectNotFoundError extends GitHubProjectError {
  constructor(details) {
    super("Project cannot be found");
    this.details = details;
  }

  toHumanMessage() {
    return `Project #${this.details.number} could not be found for @${this.details.owner}`;
  }
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
    return `"${this.details.userFieldName}" could not be matched with any of the existing field names: ${projectFieldNames}. If the field should be considered optional, then set it to "${this.details.userFieldNameAlias}: { name: "${this.details.userFieldName}", optional: true}`;
  }
}

export class GitHubProjectInvalidValueError extends GitHubProjectError {
  constructor(details) {
    super("User value is incompatible with project field type");
    this.details = details;
  }

  toHumanMessage() {
    return `"${this.details.userValue}" is not compatible with the "${this.details.field.name}" project field which expects a value of type "${this.details.field.type}"`;
  }
}

export class GitHubProjectUnknownFieldOptionError extends GitHubProjectInvalidValueError {
  constructor(details) {
    super(details);
    this.message = "Project field option cannot be found";
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
