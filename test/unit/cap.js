/* @flow */

import * as assert from "assert";
import { describe, it } from "mocha";
import { create } from "@capnp-js/bytes";

import { capLayout } from "../../src/cap";

describe("capLayout", function () {
  const segment = { id: 0, raw: create(0), end: 0 };
  const p = {
    typeBits: 0x03,
    hi: 0x12345678,
    object: {
      segment,
      position: 0,
    },
  };

  it("reads capability indices from pointer", function () {
    assert.deepEqual(capLayout(p), {
      tag: "cap",
      index: 0x12345678,
    });
  });
});
