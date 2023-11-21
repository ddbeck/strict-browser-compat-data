import assert from "node:assert/strict";

import { browser } from "./browser";

describe("browser()", function () {
  it("throws for non-existent browsers", function () {
    assert.throws(() => browser("crumpet"), Error);
  });

  describe("Browser", function () {
    describe("#toString()", function () {
      it("returns something useful", function () {
        assert.equal(`${browser("chrome")}`, "[Browser Chrome]");
      });
    });

    describe("#releases()", function () {
      it("returns an array of releases", function () {
        assert(browser("chrome").releases().length > 99);
        assert(browser("firefox").releases().length > 99);
      });
    });
  });
});
