import assert from "node:assert/strict";

import { feature } from "./feature";
import { query } from "./query";

describe("feature()", function () {
  it("accepts __compat object", function () {
    feature(
      "css.properties.border-color",
      query("css.properties.border-color"),
    );
  });

  it("queries BCD without data supplied", function () {
    const f = feature("css.properties.border-color");
    assert.equal(f.id, "css.properties.border-color");
  });
});
