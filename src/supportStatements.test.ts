import assert from "node:assert/strict";

import {
  RealSupportStatement,
  SupportStatement,
  statement,
} from "./supportStatements";

describe("statement()", function () {
  it("upgrades support statements", function () {
    const v1 = statement(new SupportStatement({ version_added: "1" }));
    assert(v1 instanceof RealSupportStatement);
  });

  it("passes through real support statements", function () {
    const original = new RealSupportStatement({ version_added: "2" });
    assert(original === statement(original));
  });

  it("accepts raw support statement objects", function () {
    const v3 = statement({ version_added: "3" });
    assert(v3 instanceof RealSupportStatement);
  });
});

describe("SupportStatement", function () {
  describe("#partial_implementation", function () {
    it("returns value", function () {
      const s = new SupportStatement({
        version_added: "1",
        version_removed: "2",
        partial_implementation: true,
      });
      assert.equal(s.partial_implementation, true);
    });

    it("returns false for undefined", function () {
      const s = new SupportStatement({
        version_added: "1",
        version_removed: "2",
      });
      assert.equal(s.partial_implementation, false);
    });
  });

  describe("#version_added", function () {
    it("returns version", function () {
      const s = new SupportStatement({
        version_added: "1",
        version_removed: "2",
      });
      assert.equal(s.version_added, "1");
    });

    it("returns false for undefined", function () {
      const s = new SupportStatement({});
      assert.equal(s.version_added, false);
    });
  });

  describe("#version_removed", function () {
    it("returns version", function () {
      const s = new SupportStatement({
        version_added: "1",
        version_removed: "2",
      });
      assert.equal(s.version_removed, "2");
    });

    it("returns false for undefined", function () {
      const s = new SupportStatement({ version_added: "1" });
      assert.equal(s.version_removed, false);
    });
  });
});

describe("RealSupportStatement", function () {
  it("throws for empty support statement", function () {
    assert.throws(() => new RealSupportStatement({}));
  });

  it("throws for missing version_added", function () {
    assert.throws(() => new RealSupportStatement({ version_removed: false }));
  });

  it("throws for explicitly undefined version_added or version_removed", function () {
    assert.throws(() => new RealSupportStatement({ version_added: undefined }));
    assert.throws(
      () =>
        new RealSupportStatement({
          version_added: "1",
          version_removed: undefined,
        }),
    );
  });

  it("throws for null version_added or version_removed", function () {
    assert.throws(() => new RealSupportStatement({ version_added: null }));
    assert.throws(
      () =>
        new RealSupportStatement({ version_added: "1", version_removed: null }),
    );
  });

  it("throws for true version_added or version_removed", function () {
    assert.throws(() => new RealSupportStatement({ version_added: true }));
    assert.throws(
      () =>
        new RealSupportStatement({
          version_added: "1",
          version_removed: true,
        }),
    );
  });

  it("does not throw for false version_added or version_removed", function () {
    assert.doesNotThrow(
      () => new RealSupportStatement({ version_added: false }),
    );
    assert.doesNotThrow(
      () =>
        new RealSupportStatement({
          version_added: "1",
          version_removed: false,
        }),
    );
  });
});
