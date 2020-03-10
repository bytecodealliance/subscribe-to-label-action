const core = require("@actions/core");
const github = require('@actions/github');

async function run() {
  try {
    console.log(github.context.payload);

    // const repoToken = core.getInput("repo-token");
    // const octokit = new github.GitHub(repoToken);

    const users = core.getInput("users");
    console.log(users);

    // const { owner, repo } = github.context.repo;

    // await octokit.issues.get({
    //   owner,
    //   repo,
    //   issue_number
    // });

    // octokit.issues.createComment({
    //   owner,
    //   repo,
    //   issue_number,
    //   body
    // });
  } catch (error) {
    core.setFailed(`Subscribe to label error: ${error.message}\n\nStack:\b${error.stack}`);
  }
}

run()
