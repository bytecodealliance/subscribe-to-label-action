const core = require("@actions/core");
const github = require('@actions/github');

async function main() {
  try {
    const issueNumber = (github.context.payload.issue || github.contet.payload.pull_request).number;
    const label = github.context.payload.label.name;
    console.log(`Processing label "${label}" on #${issueNumber}`);

    const configPath = core.getInput("configuration-path");
    console.log("Reading subscription configuration from:", configPath);

    const repoToken = core.getInput("repo-token");
    const client = new github.GitHub(repoToken);

    const config = JSON.parse(await fetchContent(client, configPath));

    const usersToNotify = Object.entries(config)
          .filter(([_, labels]) => labels.indexOf(label) >= 0)
          .map(([user, _]) => user);
    console.log("Notifying users:", usersToNotify);

    if (usersToNotify.length === 0) {
      return;
    }

    const message = `
#### Subscribe to Label Action

This issue or pull request has been labeled "${label}".

<details> <summary>Users Subscribed to "${label}"</summary>

${usersToNotify.map(u => "* @" + u).join("\n")}

</details>

To subscribe or unsubscribe from this label, edit the <code>${configPath}</code> configuration file.

[Learn more.](https://github.com/bytecodealliance/subscribe-to-label-action)
`.trim();

    await client.issues.createComment({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: issueNumber,
      body: message,
    });
  } catch (error) {
    core.setFailed(`Subscribe to label error: ${error.message}\n\nStack:\b${error.stack}`);
  }
}

async function fetchContent(client, path) {
  const response = await client.repos.getContents({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ref: github.context.sha,
    path,
  });

  return Buffer.from(response.data.content, response.data.encoding).toString();
}

main();
