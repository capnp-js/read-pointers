/* @flow */

import type { SegmentLookup, Pointer, SegmentR, Word } from "@capnp-js/memory";

import { get } from "@capnp-js/bytes";
import { int32 } from "@capnp-js/read-data";
import { u2_mask, u3_mask } from "@capnp-js/tiny-uint";

type i33 = number;

export function offset(ref: Word<SegmentR>): i33 {
  const half = int32(ref.segment.raw, ref.position) & 0xfffffffc;
  return half + half;
}

export function single<S: SegmentR>(far: Word<S>, typeBits: 0x00 | 0x01): Pointer<S> {
  return {
    typeBits,
    hi: int32(far.segment.raw, far.position+4),
    object: {
      segment: far.segment,
      position: far.position + 8 + offset(far),
    },
  };
}

export function double<S: SegmentR>(table: SegmentLookup<S>, far: Word<S>, typeBits: 0x00 | 0x01): Pointer<S> {
  const object = {
    segment: table.segment(int32(far.segment.raw, far.position+4) >>> 0),
    position: offset(far),
  };

  const hi = int32(far.segment.raw, far.position+12);

  return {
    typeBits,
    hi,
    object,
  };
}

export function unsafe<S: SegmentR>(table: SegmentLookup<S>, ref: Word<SegmentR>): Pointer<S> {
  const lsb = get(ref.position, ref.segment.raw);
  const typeBits = u2_mask(lsb, 0x03);
  if (typeBits === 0x02) {
    const far = {
      segment: table.segment(int32(ref.segment.raw, ref.position+4) >>> 0),
      position: (int32(ref.segment.raw, ref.position) & 0xfffffff8) >>> 0,
    };

    /* By using the 0x01 mask on the object's type bits, capability "objects"
     * get converted to nonsense lists. */
    if (u3_mask(lsb, 0x04) === 0x00) {
      /* Single Hop */
      return single(far, u2_mask(get(far.position, far.segment.raw), 0x01));
    } else {
      /* Double Hop */
      return double(table, far, u2_mask(get(far.position+8, far.segment.raw), 0x01));
    }
  } else {
    /* `ref` can be reconstructed as a `Word<S>` by using
     * `table.segment(ref.segment.id)`. The covariance of the `segment`
     * property on `Word<.>` makes these `ref`-to-`Word<S>` safe type casts. An
     * `S`-typed version of `ref`'s segment can be obtained with
     * `table.segment(ref.segment.id)`, so `ref.segment`-to-`S` is also a safe
     * type cast. */
    return {
      typeBits,
      hi: int32(ref.segment.raw, ref.position+4),
      object: typeBits === 0x03 ? ((ref: any): Word<S>) : { // eslint-disable-line flowtype/no-weak-types
        segment: ((ref.segment: any): S), // eslint-disable-line flowtype/no-weak-types
        position: ref.position + 8 + offset(ref),
      },
    };
  }
}
