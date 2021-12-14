// @ts-check

const queryIssuesAndPullRequestNodes = `
                id
                number
                title
                createdAt
                databaseId
                assignees(first:10) {
                  nodes {
                    login
                  }
                }
                labels(first:10){
                  nodes {
                    name
                  }
                }
                closed
                closedAt
                createdAt
                milestone {
                  number
                  title
                  state
                }
                repository {
                  nameWithOwner
                }
`;

const query = `
  query getMemexProject($org: String!,$number: Int!) {
    organization(login: $org) {
      projectNext(number: $number) {
        id
        title
        description
        url
        fields(first: 20) {
          nodes {
            id
            name
            settings
          }
        }
        items(first: 100) {
          nodes {
            id
            title
            content {
              __typename
              ... on Issue {
                ${queryIssuesAndPullRequestNodes}
              }
              ... on PullRequest {
                ${queryIssuesAndPullRequestNodes}
                merged
              }
            }
            fieldValues(first: 20) {
              nodes {
                value
                projectField {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * @param {import("../").default} project
 * @returns {Promise<import("..").GitHubProjectItem[]>}
 */
export default async function listItems(project) {
  const result = await project.octokit.graphql(query, {
    org: project.org,
    number: project.number,
  });

  const {
    organization: { projectNext },
  } = result;

  const projectFields = toFields(project, projectNext.fields.nodes);

  return projectNext.items.nodes.reduce((acc, item) => {
    const fields = toItemFields(projectFields, item.fieldValues.nodes);

    // item is draft
    if (!item.content) {
      return acc.concat({
        id: item.id,
        fields,
        isDraft: true,
      });
    }

    // item is issue or pull request
    const common = {
      id: item.content.id,
      number: item.content.number,
      createdAt: item.content.createdAt,
      closed: item.content.closed,
      closedAt: item.content.closedAt,
      assignees: item.content.assignees.nodes.map((node) => node.login),
      labels: item.content.labels.nodes.map((node) => node.name),
      repository: item.content.repository.nameWithOwner,
      milestone: item.content.milestone,
    };
    const issueOrPullRequest =
      item.content.__typename === "Issue"
        ? {
            isIssue: true,
            isPullRequest: false,
            ...common,
          }
        : {
            isIssue: false,
            isPullRequest: true,
            ...common,
            merged: item.content.merged,
          };

    return acc.concat({
      id: item.id,
      fields,
      isDraft: false,
      issueOrPullRequest,
    });
  }, []);
}

const READ_ONLY_FIELDS = [
  "Assignees",
  "Labels",
  "Repository",
  "Milestone",
  "Linked Pull Requests",
];

/**
 * @param {import("..").default} project
 * @param {import("..").ProjectFieldNode[]} nodes
 * @returns {import("..").ProjectFieldMap}
 */
function toFields(project, nodes) {
  return nodes.reduce((acc, node) => {
    if (READ_ONLY_FIELDS.includes(node.name)) {
      return acc;
    }

    const key = fieldNameToInternalName(project, node.name);
    acc[key] = {
      id: node.id,
      name: node.name,
    };

    // Settings is a JSON string. It contains view information such as column width.
    // If the field is of type "Single select", then the `options` property will be set.
    const settings = JSON.parse(node.settings);
    if (settings?.options) {
      acc[key].optionsById = settings.options.reduce((acc, option) => {
        return {
          ...acc,
          [option.id]: option.name,
        };
      }, {});
      acc[key].optionsByValue = settings.options.reduce((acc, option) => {
        return {
          ...acc,
          [option.name]: option.id,
        };
      }, {});
    }

    return acc;
  }, {});
}

/**
 * Returns internal name for a project field
 *
 * @param {import('..').default} project
 * @param {string} name
 * @returns string
 */
function fieldNameToInternalName(project, name) {
  const result = Object.entries(project.fields).find(
    ([, value]) => value === name
  );

  if (!result) {
    throw new Error(`Unknown column name: ${name}`);
  }

  return result[0];
}

/**
 *
 * @param {import("..").ProjectFieldMap} projectFields
 * @param {import("..").ProjectFieldValueNode[]} nodes
 * @returns {Record<string, string>}
 */
function toItemFields(projectFields, nodes) {
  return Object.entries(projectFields).reduce(
    (acc, [projectFieldName, projectField]) => {
      const rawValue =
        nodes.find((node) => node.projectField.id === projectField.id)?.value ||
        null;

      const value =
        "optionsById" in projectField
          ? projectField.optionsById[rawValue]
          : rawValue;

      return {
        ...acc,
        [projectFieldName]: value,
      };
    },
    {}
  );
}
