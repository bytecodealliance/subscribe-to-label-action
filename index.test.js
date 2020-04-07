/*global test*/
const assert = require("assert");
const { getUsersToNotifyForLabel, getCommentLabels, makeMessage } = require("./subscribe-to-label");

test("test getUsersToNotifyForLabel", () => {
  const config = {
    "fitzgen": ["fuzzing"],
    "bob": ["wasmtime", "fuzzing"],
  };

  const fuzzingUsers = getUsersToNotifyForLabel(config, "fuzzing");
  assert.deepEqual(fuzzingUsers, ["fitzgen", "bob"]);

  const wasmtimeUsers = getUsersToNotifyForLabel(config, "wasmtime");
  assert.deepEqual(wasmtimeUsers, ["bob"]);

  const zzzUsers = getUsersToNotifyForLabel(config, "zzz");
  assert.deepEqual(zzzUsers, []);
});

test("test makeMessage", () => {
  const expected = `
#### Subscribe to Label Action

cc @bnjbvr, @fitzgen

<details>
This issue or pull request has been labeled: "awesome", "cranelift", "fuzzing"

Thus the following users have been cc'd because of the following labels:

* bnjbvr: cranelift, fuzzing
* fitzgen: fuzzing

To subscribe or unsubscribe from this label, edit the <code>.github/subscribe-to-label.json</code> configuration file.

[Learn more.](https://github.com/bytecodealliance/subscribe-to-label-action)
</details>
`.trim();

  let userToLabel = new Map();
  userToLabel.set('bnjbvr', ['fuzzing', 'cranelift']);
  userToLabel.set('fitzgen', ['fuzzing']);

  let labels = ['fuzzing', 'awesome', 'cranelift'];

  let configPath = '.github/subscribe-to-label.json';

  const observed = makeMessage(userToLabel, labels, configPath);

  assert.equal(expected, observed);
});

test("test getCommentLabels", () => {
  let userToLabel = new Map();
  userToLabel.set('fitzgen', ['fuzzing']);
  let providedLabels = ['fuzzing', 'cranelift'];
  let configPath = '.github/subscribe-to-label.json';

  const comment = makeMessage(userToLabel, providedLabels, configPath);

  const labels = getCommentLabels(comment);
  assert.deepEqual(labels, ["fuzzing", "cranelift"].sort());
});

test("test getCommentLabels with single label", () => {
  let userToLabel = new Map();
  userToLabel.set('fitzgen', ['fuzzing']);
  let providedLabels = ['fuzzing'];
  let configPath = '.github/subscribe-to-label.json';

  const comment = makeMessage(userToLabel, providedLabels, configPath);

  const labels = getCommentLabels(comment);
  assert.deepEqual(labels, ["fuzzing"]);
});
