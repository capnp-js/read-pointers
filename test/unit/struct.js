/* @flow */

import test from "ava";

import structLayout from "../../src/structLayout";

test("`structLayout`", t => {
  const segment = {
    id: 0,
    raw: new Uint8Array(0),
    end: 0,
  };

  const p = {
    typeBits: 0x00,
    hi: 0x132a41ba,
    object: {
      segment,
      position: 0,
    },
  };
  const bytes = {
    data: (p.hi & 0x0000ffff) << 3,
    pointers: (p.hi & 0xffff0000) >> (16 - 3),
  };
  t.deepEqual(structLayout(p), {
    tag: "struct",
    bytes,
    dataSection: p.object.position,
    pointersSection: p.object.position + bytes.data,
    end: p.object.position + bytes.data + bytes.pointers,
  });
});
