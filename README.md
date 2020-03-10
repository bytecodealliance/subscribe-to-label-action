# Subscribe to Label Action

Allows users to subscribe to a label and automatically get @'d when the label is
added to a pull request or issue.

## Usage

Add a `.github/workflows/subscribe-to-label.yml` file to your repository
containing the following configuration:

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
        users:
          # A map from username to a list of labels the user is subscribed to.
          # Whenever an issue or pull request is labeled with a label in a
          # user's subscription list, they will be @'d in a comment.
          example_user_1: ["bug", "help wanted"]
          example_user_2: ["good first issue"]
          example_user_3: ["enhancement"]
          # ...
```

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).
