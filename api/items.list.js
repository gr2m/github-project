// @ts-check

import { getProjectWithItemsQuery } from "./lib/queries.js";
import { projectFieldsNodesToFieldsMap } from "./lib/project-fields-nodes-to-fields-map.js";
import { projectItemNodeToGitHubProjectItem } from "./lib/project-item-node-to-github-project-item.js";

/**
 * @param {import("../").default} project
 * @returns {Promise<import("..").GitHubProjectItem[]>}
 */
export default async function listItems(project) {
  const {
    organization: { projectNext },
  } = await project.octokit.graphql(getProjectWithItemsQuery, {
    org: project.org,
    number: project.number,
  });

  const projectFields = projectFieldsNodesToFieldsMap(
    project,
    projectNext.fields.nodes
  );

  return projectNext.items.nodes.map((node) =>
    projectItemNodeToGitHubProjectItem(projectFields, node)
  );
}
