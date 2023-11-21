import assert from "node:assert/strict";

import { browser } from "./browser";
import { Release } from "./release";

describe("Release", function () {
  describe("toString()", function () {
    it("returns something useful", function () {
      const r = browser("chrome").releases().at(-1) as Release;
      assert(r.toString().startsWith("[Chrome 1"), r.toString());
    });
  });
});
