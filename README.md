# Subscribe to Label Action

Allows users to subscribe to a label and automatically get @'d when the label is
added to a pull request or issue.

## Usage

Add a `.github/workflows/subscribe-to-label.yml` file to your repository:

```yaml
name: "Subscribe to Label"
on:
  issues:
    types: ["labeled"]
  schedule:
    # Run pull request triage every 5 minutes. Ideally, this would be on
    # "labeled" types of pull request events, but that doesn't work if the pull
    # request is from another fork. For example, see
    # https://github.com/actions/labeler/issues/12
    - cron: '*/5 * * * *'
jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
    - uses: bytecodealliance/subscribe-to-label-action@v1
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
```

Then, configure which users or teams get @'d when for which labels in
`.github/subscribe-to-label.json`:

```json
{
    "example_user_1": ["bug", "help wanted"],
    "example_user_2": ["good first issue"],
    "example_user_3": ["enhancement"],
    "org/team_1": ["question"]
}
```

**Note**: When using the action to subscribe teams, you must use an account which is a member of the organization the team is in. The default `github-actions` bot does not have the permissions necessary to reference teams (see [this example](https://github.com/WordPress/openverse/issues/320)).

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).
