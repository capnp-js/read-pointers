/* @flow */

import test from "ava";

import { listEncodings } from "@capnp-js/layout";
import {
  boolListLayout,
  subwordListLayout,
  inlineCompositeListLayout,
} from "../../src/list";

test("`boolListLayout`", t => {
  const segment = {
    id: 0,
    raw: new Uint8Array(8),
    end: 8,
  };

  const p = {
    typeBits: 0x01,
    hi: (6<<3) | 0x01,
    object: {
      segment,
      position: 0,
    },
  };

  t.deepEqual(boolListLayout(p), {
    tag: "bool list",
    begin: 0,
    length: 6,
  });
});

test("`subwordListLayout`", t => {
  t.plan(6);

  const segment = {
    id: 0,
    raw: new Uint8Array(0),
    end: 0,
  };

  let p = {
    typeBits: 0x01,
    hi: (2<<3) | 0x00,
    object: {
      segment,
      position: 0,
    },
  };
  t.deepEqual(subwordListLayout(p, 0x00), {
    tag: "non-bool list",
    encoding: listEncodings[0x00],
    begin: 0,
    length: 2,
  });

  p.hi = (2<<3) | 0x02;
  t.deepEqual(subwordListLayout(p, 0x02), {
    tag: "non-bool list",
    encoding: listEncodings[0x02],
    begin: 0,
    length: 2,
  });

  p.hi = (2<<3) | 0x03;
  t.deepEqual(subwordListLayout(p, 0x03), {
    tag: "non-bool list",
    encoding: listEncodings[0x03],
    begin: 0,
    length: 2,
  });

  p.hi = (2<<3) | 0x04;
  t.deepEqual(subwordListLayout(p, 0x04), {
    tag: "non-bool list",
    encoding: listEncodings[0x04],
    begin: 0,
    length: 2,
  });

  p.hi = (2<<3) | 0x05;
  t.deepEqual(subwordListLayout(p, 0x05), {
    tag: "non-bool list",
    encoding: listEncodings[0x05],
    begin: 0,
    length: 2,
  });

  p.hi = (2<<3) | 0x06;
  t.deepEqual(subwordListLayout(p, 0x06), {
    tag: "non-bool list",
    encoding: listEncodings[0x06],
    begin: 0,
    length: 2,
  });
});

test("`inlineCompositeListLayout`", t => {
  t.plan(1);

  const segment = {
    id: 0,
    raw: new Uint8Array(8),
    end: 8,
  };
  segment.raw[0] = (2<<2) | 0x00;
  segment.raw[4] = 0x01;
  segment.raw[6] = 0x02;

  const p = {
    typeBits: 0x01,
    hi: (6<<3) | 0x07,
    object: {
      segment,
      position: 0,
    },
  };
  const bytes = { data: 8, pointers: 16 };
  t.deepEqual(inlineCompositeListLayout(p, bytes), {
    tag: "non-bool list",
    encoding: {
      flag: 0x07,
      bytes,
    },
    begin: 8,
    length: 2,
  });
});
