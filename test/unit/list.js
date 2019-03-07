/* @flow */

import * as assert from "assert";
import { describe, it } from "mocha";
import { create, set } from "@capnp-js/bytes";
import { listEncodings } from "@capnp-js/layout";

import {
  boolListLayout,
  subwordListLayout,
  inlineCompositeListLayout,
} from "../../src/list";

describe("boolListLayout", function () {
  const segment = { id: 0, raw: create(8), end: 8 };
  const p = {
    typeBits: 0x01,
    hi: (6<<3) | 0x01,
    object: {
      segment,
      position: 0,
    },
  };

  it("decodes bool list layouts from pointer", function () {
    assert.deepEqual(boolListLayout(p), {
      tag: "bool list",
      begin: 0,
      length: 6,
    });
  });
});

describe("subwordListLayout", function () {
  const segment = { id: 0, raw: create(0), end: 0 };
  const p = {
    typeBits: 0x01,
    hi: 0,
    object: {
      segment,
      position: 0,
    },
  };

  it("decodes non-bool 0x00 list layouts from pointer", function () {
    p.hi = (2<<3) | 0x00;
    assert.deepEqual(subwordListLayout(p, 0x00), {
      tag: "non-bool list",
      encoding: listEncodings[0x00],
      begin: 0,
      length: 2,
    });
  });

  it("decodes non-bool 0x02 list layouts from pointer", function () {
    p.hi = (2<<3) | 0x02;
    assert.deepEqual(subwordListLayout(p, 0x02), {
      tag: "non-bool list",
      encoding: listEncodings[0x02],
      begin: 0,
      length: 2,
    });
  });

  it("decodes non-bool 0x03 list layouts from pointer", function () {
    p.hi = (2<<3) | 0x03;
    assert.deepEqual(subwordListLayout(p, 0x03), {
      tag: "non-bool list",
      encoding: listEncodings[0x03],
      begin: 0,
      length: 2,
    });
  });

  it("decodes non-bool 0x04 list layouts from pointer", function () {
    p.hi = (2<<3) | 0x04;
    assert.deepEqual(subwordListLayout(p, 0x04), {
      tag: "non-bool list",
      encoding: listEncodings[0x04],
      begin: 0,
      length: 2,
    });
  });

  it("decodes non-bool 0x05 list layouts from pointer", function () {
    p.hi = (2<<3) | 0x05;
    assert.deepEqual(subwordListLayout(p, 0x05), {
      tag: "non-bool list",
      encoding: listEncodings[0x05],
      begin: 0,
      length: 2,
    });
  });

  it("decodes non-bool 0x06 list layouts from pointer", function () {
    p.hi = (2<<3) | 0x06;
    assert.deepEqual(subwordListLayout(p, 0x06), {
      tag: "non-bool list",
      encoding: listEncodings[0x06],
      begin: 0,
      length: 2,
    });
  });
});

describe("inlineCompositeListLayout", function () {
  const segment = { id: 0, raw: create(8), end: 8 };

  it("decodes non-bool 0x07 list layouts from pointer", function () {
    set((2<<2) | 0x00, 0, segment.raw);
    set(0x01, 4, segment.raw);
    set(0x02, 6, segment.raw);

    const p = {
      typeBits: 0x01,
      hi: (6<<3) | 0x07,
      object: {
        segment,
        position: 0,
      },
    };

    const bytes = { data: 8, pointers: 16 };
    assert.deepEqual(inlineCompositeListLayout(p, bytes), {
      tag: "non-bool list",
      encoding: {
        flag: 0x07,
        bytes,
      },
      begin: 8,
      length: 2,
    });
  });
});
