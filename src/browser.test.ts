import assert from "node:assert/strict";

import { browser } from "./browser";

describe("browser()", function () {
  it("throws for non-existent browsers", function () {
    assert.throws(() => browser("crumpet"), Error);
  });

  describe("Browser", function () {
    it("#toString()", function () {
      assert.equal(`${browser("chrome")}`, "[Browser Chrome]");
    });
  });
});
