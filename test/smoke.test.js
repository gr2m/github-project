import test from "ava";

import GitHubProject from "../index.js";

test("smoke", (t) => {
  t.is(typeof GitHubProject, "function");
});
