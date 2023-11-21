import assert from "node:assert/strict";

import { browser } from "./browser";

describe("browser()", function () {
  it("throws for non-existent browsers", function () {
    assert.throws(() => browser("crumpet"), Error);
  });
});
