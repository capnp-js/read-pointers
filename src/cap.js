/* @flow */

import type { CapLayout } from "@capnp-js/layout";
import type { Pointer, SegmentR } from "@capnp-js/memory";

export function capLayout(p: Pointer<SegmentR>): CapLayout {
  return {
    tag: "cap",
    index: p.hi >>> 0,
  };
}
