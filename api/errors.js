// @ts-check

export class GitHubProjectError extends Error {
  constructor(...args) {
    super(...args);
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
