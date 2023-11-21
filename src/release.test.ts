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

  describe("date()", function () {
    it("get the date as a date object", function () {
      const release = browser("chrome")
        .releases()
        .find((r) => r.version === "100") as Release;
      console.log(release);
      assert.equal(release.date().getTime(), new Date("2022-03-29").getTime());
    });
  });
});
