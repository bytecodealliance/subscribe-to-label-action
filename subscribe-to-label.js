const core = require("@actions/core");
const github = require("@actions/github");

async function main() {
  try {
    const repoToken = core.getInput("repo-token");
    const client = new github.GitHub(repoToken);

    const configPath = core.getInput("configuration-path");
    console.log("Reading subscription configuration from:", configPath);
    const config = JSON.parse(await fetchContent(client, configPath));

    if (github.context.payload.issue) {
      const issueNumber = github.context.payload.issue.number;
      const labels = [github.context.payload.label.name];
      await processIssue(client, config, configPath, issueNumber, labels);
    } else {
      await triagePullRequests(client, config, configPath);
    }
  } catch (error) {
    console.error(
      `Subscribe to label error: ${error.message}\n\nStack:\b${error.stack}`
    );
    core.setFailed(
      `Subscribe to label error: ${error.message}\n\nStack:\b${error.stack}`
    );
  }
}
exports.main = main;

function makeMessage(userToLabel, labels, configPath) {
  // XXX: if you change the format of this message, make sure that we still
  // match it correctly in `triagePullRequests` and in `getCommentLabels`!!1!
  let allUsers = Array.from(userToLabel.keys())
    .map((user) => "@" + user)
    .sort()
    .join(", ");
  let reasons = Array.from(userToLabel.entries())
    .map(([user, userLabels]) => `* ${user}: ${userLabels.sort().join(", ")}`)
    .sort()
    .join("\n");

  return `
#### Subscribe to Label Action

cc ${allUsers}

<details>
This issue or pull request has been labeled: ${[...labels]
    .map((l) => '"' + l + '"')
    .sort()
    .join(", ")}

Thus the following users have been cc'd because of the following labels:

${reasons}

To subscribe or unsubscribe from this label, edit the <code>${configPath}</code> configuration file.

[Learn more.](https://github.com/bytecodealliance/subscribe-to-label-action)
</details>
`.trim();
}
exports.makeMessage = makeMessage;

async function processIssue(client, config, configPath, issueNumber, labels) {
  const userToLabel = new Map();
  for (const label of labels) {
    console.log(`Processing label "${label}" on #${issueNumber}`);

    const usersToNotify = getUsersToNotifyForLabel(config, label);
    console.log("Notifying users:", usersToNotify);

    if (usersToNotify.length === 0) {
      continue;
    }

    for (let user of usersToNotify) {
      if (!userToLabel.has(user)) {
        userToLabel.set(user, [label]);
      } else {
        userToLabel.get(user).push(label);
      }
    }
  }

  if (userToLabel.size === 0) {
    return;
  }

  const message = makeMessage(userToLabel, labels, configPath);

  console.log(`Creating comment:\n\n"""\n${message}\n"""`);

  await client.issues.createComment({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: issueNumber,
    body: message,
  });
}

function getUsersToNotifyForLabel(config, label) {
  return Object.entries(config)
    .filter(([_, labels]) => labels.indexOf(label) >= 0)
    .map(([user, _]) => user);
}
exports.getUsersToNotifyForLabel = getUsersToNotifyForLabel;

async function triagePullRequests(client, config, configPath) {
  const operationsPerRun = parseInt(
    core.getInput("operations-per-run", { required: true })
  );
  if (operationsPerRun <= 0) {
    throw new Error(
      `operations-per-run must be greater than zero, got ${operationsPerRun}`
    );
  }
  let operationsLeft = operationsPerRun;

  // Iterate through pull requests, finding PRs that are labeled, but for which
  // we haven't commented yet.
  const listPullsOpts = await client.pulls.list.endpoint.merge({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    state: "open",
    sort: "updated",
  });
  for await (const pulls of client.paginate.iterator(listPullsOpts)) {
    for (const pr of pulls.data) {
      if (operationsLeft <= 0) {
        warn(
          "Executed the maximum operations for this run. Stopping now to avoid " +
            "hitting the github API rate limit."
        );
        return;
      }

      console.log(
        `Triaging PR #${pr.number} for labels which need a subscription comment`
      );

      const labelsToComment = new Set(pr.labels.map((l) => l.name));
      console.log(
        `PR #${pr.number} has these labels: ${[...labelsToComment]
          .sort()
          .join(", ")}`
      );

      // Iterate through all the existing comments in this PR and find our own
      // comments. For any comment we already made, remove the associated label
      // from `labelsToComment` so we don't duplicate comments.
      const listCommentsOpts = await client.issues.listComments.endpoint.merge({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: pr.number,
      });
      for await (const comments of client.paginate.iterator(listCommentsOpts)) {
        for (const comment of comments.data) {
          // XXX: The `startsWith` check needs to be kept in sync with the
          // message that this bot comments!! Failure to do so will result in
          // lots of bot spam.
          if (
            comment.user.login !== "github-actions[bot]" ||
            !comment.body.startsWith("#### Subscribe to Label Action")
          ) {
            continue;
          }

          for (const l of getCommentLabels(comment.body)) {
            console.log(`Already left a subscription comment for label "${l}"`);
            labelsToComment.delete(l);
          }
        }
      }

      if (labelsToComment.size > 0) {
        operationsLeft -= 1;
        processIssue(client, config, configPath, pr.number, labelsToComment);
      }
    }
  }
}

function getCommentLabels(comment) {
  // Get the comment string after "labeled: ".
  const startOfLabels = comment.slice(
    comment.indexOf("labeled: ") + "labeled: ".length
  );

  // Get just the labels joined by ", " and with their quotes.
  const joinedLabels = startOfLabels.slice(0, startOfLabels.indexOf("\n"));

  // Split the labels, remove the quotes, and remove the corresponding
  // entry from `labelsToComment`.
  return joinedLabels.split(", ").map((l) => l.substring(1, l.length - 1));
}
exports.getCommentLabels = getCommentLabels;

async function fetchContent(client, path) {
  const response = await client.repos.getContents({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ref: github.context.sha,
    path,
  });

  return Buffer.from(response.data.content, response.data.encoding).toString();
}

function warn(msg) {
  console.warn(msg);
  core.warning(msg);
}
