# Subscribe to Label Action

Allows users to subscribe to a label and automatically get @'d when the label is
added to a pull request or issue.

## Usage

Add a `.github/workflows/subscribe-to-label.yml` file to your repository:

```yaml
name: "Subscribe to Label"
on:
  pull_request:
    types: ["labeled"]
  issues:
    types: ["labeled"]
jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
    - uses: bytecodealliance/subscribe-to-label-action@v1
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
```

Then, configure which users get @'d when for which labels in
`.github/subscribe-to-label.json`:

```json
{
    "example_user_1": ["bug", "help wanted"],
    "example_user_2": ["good first issue"],
    "example_user_3": ["enhancement"]
}
```

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).
