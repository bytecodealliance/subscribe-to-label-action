# Contributing

## Building and Testing

Install the dependencies:

```bash
$ npm install
```

Run the tests:

```bash
$ npm test
```

## Publishing a New Release

To publish a new vX.Y.Z release, first update (or create) the release branch for
this major version:

```bash
$ git checkout vX
$ git merge main
```

Next, Build the package and commit the built artifacts:

```bash
$ npm run package
$ git add dist
$ git commit -a -m 'Build version vX.Y.Z'
```

Finally, push the update and tag the commit:

```bash
$ git push origin vX
$ git tag vX.Y.Z
$ git push origin --tags
```
