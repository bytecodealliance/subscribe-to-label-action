/*global test*/
const assert = require("assert");
const { getUsersToNotifyForLabel, getCommentLabels } = require("./subscribe-to-label");

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

// shows how the runner will run a javascript action with env / stdout protocol
test("test getCommentLabels", () => {
  const comment = `
#### Subscribe to Label Action

This issue or pull request has been labeled: "fuzzing", "cranelift"

<details> <summary>Users Subscribed to "fuzzing"</summary>

* @fitzgen

</details>

To subscribe or unsubscribe from this label, edit the <code>.github/subscribe-to-label.json</code> configuration file.

[Learn more.](https://github.com/bytecodealliance/subscribe-to-label-action)
`.trim();

  const labels = getCommentLabels(comment);
  assert.deepEqual(labels, ["fuzzing", "cranelift"]);
});
