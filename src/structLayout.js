/* @flow */

import type { StructLayout } from "@capnp-js/layout";
import type { Pointer, SegmentR } from "@capnp-js/memory";

import { structBytes } from "@capnp-js/layout";

export default function structLayout(p: Pointer<SegmentR>): StructLayout {
  const bytes = structBytes(p.hi);
  const pointersSection = p.object.position + bytes.data;
  return {
    tag: "struct",
    bytes,
    dataSection: p.object.position,
    pointersSection,
    end: pointersSection + bytes.pointers,
  };
}
