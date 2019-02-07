/* @flow */

import * as assert from "assert";
import { describe, it } from "mocha";

import { root } from "@capnp-js/memory";

import { unsafe } from "../../src/pointer";

describe("unsafe", function () {
  {
    const segments = [
      { id: 0, raw: new Uint8Array(8), end: 8 },
      { id: 1, raw: new Uint8Array(32), end: 32 },
    ];
    const table = {
      segments,
      segment(id) {
        return segments[id];
      },
    };
    segments[0].raw[0] = 0x02;
    segments[0].raw[4] = 0x01;

    it("decodes struct landing pad from single hop far-pointers", function () {
      segments[1].raw[0] = 0x00;
      segments[1].raw[4] = 0x01;
      segments[1].raw[6] = 0x02;
      const p1 = unsafe(table, root(table));
      assert.equal(p1.typeBits, 0x00);
      assert.equal(p1.hi, (0x02<<16) | 0x01);
      assert.deepEqual(p1.object, {segment: segments[1], position: 8});
    });

    it("decodes list landing pad from single hop far-pointers", function () {
      segments[1].raw.fill(0, 0, 8);
      segments[1].raw[0] = 0x01;
      segments[1].raw[4] = (3<<3) | 0x05;
      const p2 = unsafe(table, root(table));
      assert.equal(p2.typeBits, 0x01);
      assert.equal(p2.hi, (3<<3) | 0x05);
      assert.deepEqual(p2.object, {segment: segments[1], position: 8});
    });

    it("doesn't reject single hop far-pointer landing pad from single hop far-pointers", function () {
      segments[1].raw.fill(0, 0, 8);
      segments[1].raw[0] = 0x02;
      assert.doesNotThrow(() => unsafe(table, root(table)));
      //TODO: This follows the landing pad's pointer, so I should check that it's correct
    });

    it("doesn't reject double hop far-pointer landing pad from single hop far-pointers", function () {
      segments[1].raw.fill(0, 0, 8);
      segments[1].raw[0] = 0x04 | 0x02;
      assert.doesNotThrow(() => unsafe(table, root(table)));
      //TODO: This follows the landing pad's pointer, so I should check that it's correct
    });

    it("doesn't reject capability landing pad from single hop far-pointers", function () {
      segments[1].raw.fill(0, 0, 8);
      segments[1].raw[0] = 0x03;
      assert.doesNotThrow(() => unsafe(table, root(table)));
      //TODO: This decodes the capability, so I should check that it's correct
    });

    it("doesn't reject out of bounds landing pad from single hop far-pointers", function () {
      segments[0].raw[0] = (4<<3) | 0x02;
      assert.doesNotThrow(() => unsafe(table, root(table)));
    });
  }

  {
    const segments = [
      { id: 0, raw: new Uint8Array(8), end: 8 },
      { id: 1, raw: new Uint8Array(16), end: 16 },
      { id: 2, raw: new Uint8Array(32), end: 32 },
    ];
    const table = {
      segments,
      segment(id) {
        return segments[id];
      },
    };
    segments[0].raw[0] = 0x04 | 0x02;
    segments[0].raw[4] = 0x01;
    segments[1].raw[0] = 0x02;
    segments[1].raw[4] = 0x02;

    it("decodes struct landing pad from double hop far-pointers", function () {
      segments[1].raw[8] = 0x00;
      segments[1].raw[12] = 0x01;
      segments[1].raw[14] = 0x03;
      const p1 = unsafe(table, root(table));
      assert.equal(p1.typeBits, 0x00);
      assert.equal(p1.hi, (0x03<<16) | 0x01);
      assert.deepEqual(p1.object, {segment: segments[2], position: 0});
    });

    it("decodes list landing pad from double hop far-pointers", function () {
      segments[1].raw.fill(0, 8, 16);
      segments[1].raw[8] = 0x01;
      segments[1].raw[12] = (4<<3) | 0x05;
      const p2 = unsafe(table, root(table));
      assert.equal(p2.typeBits, 0x01);
      assert.equal(p2.hi, (4<<3) | 0x05);
      assert.deepEqual(p2.object, {segment: segments[2], position: 0});
    });

    it("doesn't reject far-pointer tag from double hop far-pointers", function () {
      segments[1].raw.fill(0, 8, 16);
      segments[1].raw[8] = 0x02;
      assert.doesNotThrow(() => unsafe(table, root(table)));
    });

    it("doesn't reject capability tag from double hop far-pointers", function () {
      segments[1].raw.fill(0, 8, 16);
      segments[1].raw[8] = 0x03;
      assert.doesNotThrow(() => unsafe(table, root(table)));
    });

    it("doesn't reject struct landing pad from double hop far-pointers", function () {
      segments[1].raw.fill(0, 0, 16);
      segments[1].raw[0] = 0x00;
      assert.doesNotThrow(() => unsafe(table, root(table)));
    });

    it("doesn't reject list landing pad from double hop far-pointers", function () {
      segments[1].raw.fill(0, 0, 16);
      segments[1].raw[0] = 0x01;
      assert.doesNotThrow(() => unsafe(table, root(table)));
    });

    it("doesn't reject capability landing pad from double hop far-pointers", function () {
      segments[1].raw.fill(0, 0, 16);
      segments[1].raw[0] = 0x03;
      assert.doesNotThrow(() => unsafe(table, root(table)));
    });

    it("doesn't reject double hop far-pointer from double hop far-pointers", function () {
      segments[1].raw.fill(0, 0, 16);
      segments[1].raw[0] = 0x04 | 0x02;
      assert.doesNotThrow(() => unsafe(table, root(table)));
    });

    it("doesn't reject out of bounds landing pad from double hop far-pointers", function () {
      segments[0].raw.fill(0, 0, 8);
      segments[0].raw[0] = (2<<3) | 0x04 | 0x02;
      segments[0].raw[4] = 0x01;
      segments[1].raw.fill(0, 0, 16);
      segments[1].raw[0] = (4<<3) | 0x02; //TODO: This was working on segments[0]. That was a bug, right?
      assert.doesNotThrow(() => unsafe(table, root(table)));
    });
  }
});
