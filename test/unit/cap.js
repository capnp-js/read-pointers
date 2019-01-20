/* @flow */

import test from "ava";

import { capLayout } from "../../src/cap";

test("`capLayout`", t => {
  const segment = {
    id: 0,
    raw: new Uint8Array(0),
    end: 0,
  };

  let p = {
    typeBits: 0x03,
    hi: 0x12345678,
    object: {
      segment,
      position: 0,
    },
  };

  t.deepEqual(capLayout(p), {
    tag: "cap",
    index: 0x12345678,
  });
});
