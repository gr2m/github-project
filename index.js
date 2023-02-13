// @ts-check

import { Octokit } from "@octokit/core";

import { listItems } from "./api/items.list.js";
import { addDraftItem } from "./api/items.add-draft.js";
import { addItem } from "./api/items.add.js";
import { getItem } from "./api/items.get.js";
import { getItemByContentId } from "./api/items.get-by-content-id.js";
import { getItemByContentRepositoryAndNumber } from "./api/items.get-by-content-repository-and-number.js";
import { updateItem } from "./api/items.update.js";
import { updateItemByContentId } from "./api/items.update-by-content-id.js";
import { updateItemByContentRepositoryAndNumber } from "./api/items.update-by-content-repository-and-number.js";
import { archiveItem } from "./api/items.archive.js";
import { archiveItemByContentId } from "./api/items.archive-by-content-id.js";
import { archiveItemByContentRepositoryAndNumber } from "./api/items.archive-by-content-repository-and-number.js";
import { removeItem } from "./api/items.remove.js";
import { removeItemByContentId } from "./api/items.remove-by-content-id.js";
import { removeItemByContentRepositoryAndNumber } from "./api/items.remove-by-content-repository-and-name.js";
import { getProperties } from "./api/project.getProperties.js";

import { defaultMatchFunction } from "./api/lib/default-match-function.js";

/** @type {import("./").BUILT_IN_FIELDS} */
export const BUILT_IN_FIELDS = {
  title: "Title",
  status: "Status",
};

export default class GitHubProject {
  /**
   * @param {import(".").GitHubProjectOptions} options
   */
  constructor(options) {
    const { owner, number, fields = {} } = options;

    // set octokit either from `options.octokit` or `options.token`
    const octokit =
      "token" in options
        ? new Octokit({ auth: options.token })
        : options.octokit;

    /** @type {import(".").GitHubProjectState} */
    const state = {
      didLoadFields: false,
      matchFieldName: options.matchFieldName || defaultMatchFunction,
      matchFieldOptionValue:
        options.matchFieldOptionValue || defaultMatchFunction,
    };

    // set API
    const itemsApi = {
      list: listItems.bind(null, this, state),
      addDraft: addDraftItem.bind(null, this, state),
      add: addItem.bind(null, this, state),
      get: getItem.bind(null, this, state),
      getByContentId: getItemByContentId.bind(null, this, state),
      getByContentRepositoryAndNumber: getItemByContentRepositoryAndNumber.bind(
        null,
        this,
        state
      ),
      update: updateItem.bind(null, this, state),
      updateByContentId: updateItemByContentId.bind(null, this, state),
      updateByContentRepositoryAndNumber:
        updateItemByContentRepositoryAndNumber.bind(null, this, state),
      archive: archiveItem.bind(null, this, state),
      archiveByContentId: archiveItemByContentId.bind(null, this, state),
      archiveByContentRepositoryAndNumber:
        archiveItemByContentRepositoryAndNumber.bind(null, this, state),
      remove: removeItem.bind(null, this, state),
      removeByContentId: removeItemByContentId.bind(null, this, state),
      removeByContentRepositoryAndNumber:
        removeItemByContentRepositoryAndNumber.bind(null, this, state),
    };

    const projectApi = {
      getProperties: getProperties.bind(null, this, state),
    };

    Object.defineProperties(this, {
      owner: { get: () => owner },
      number: { get: () => number },
      fields: { get: () => ({ ...BUILT_IN_FIELDS, ...fields }) },
      octokit: { get: () => octokit },
      items: { get: () => itemsApi },
      getProperties: { get: () => projectApi.getProperties },
    });
  }

  /**
   * Returns a GithubProject instance and calls `getProperties()` to preload
   * project level properties.
   *
   * @param {import(".").GitHubProjectOptions} options
   *
   * @return {Promise<import(".").default>}
   */
  static async getInstance(options) {
    const project = new GitHubProject(options);
    await project.getProperties();

    return project;
  }
}
