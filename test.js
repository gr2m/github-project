import { test } from "uvu";
import * as assert from "uvu/assert";

import GitHubProject from "./index.js";

test("smoke", () => {
  assert.type(GitHubProject, "function");
  new GitHubProject();
});

test.run();
