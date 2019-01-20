/* @flow */

import type {
  Bytes,
  SubwordFlag,
  NonboolListEncoding,
  BoolListLayout,
  NonboolListLayout,
} from "@capnp-js/layout";

import type { Pointer, SegmentR } from "@capnp-js/memory";

import { int32 } from "@capnp-js/read-data";
import { listEncodings, structBytes } from "@capnp-js/layout";

export function inlineCompositeEncoding(p: Pointer<SegmentR>): NonboolListEncoding {
  return {
    flag: 0x07,
    bytes: structBytes(int32(p.object.segment.raw, p.object.position+4)),
  };
}

export function boolListLayout(p: Pointer<SegmentR>): BoolListLayout {
  return {
    tag: "bool list",
    begin: p.object.position,
    length: p.hi >>> 3,
  };
}

export function subwordListLayout(p: Pointer<SegmentR>, flag: SubwordFlag): NonboolListLayout {
  return {
    tag: "non-bool list",
    encoding: listEncodings[flag],
    begin: p.object.position,
    length: p.hi >>> 3,
  };
}

export function inlineCompositeListLayout(p: Pointer<SegmentR>, bytes: Bytes): NonboolListLayout {
  return {
    tag: "non-bool list",
    encoding: {
      flag: 0x07,
      bytes,
    },
    begin: p.object.position + 8,
    length: int32(p.object.segment.raw, p.object.position) >>> 2,
  };
}
