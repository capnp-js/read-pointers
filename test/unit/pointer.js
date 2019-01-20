/* @flow */

import test from "ava";

import { root } from "@capnp-js/memory";

import { unsafe } from "../../src/pointer";

test("Single hop `unsafe`", t => {
  t.plan(10);

  const segments = [{
    id: 0,
    raw: new Uint8Array(8),
    end: 8,
  }, {
    id: 1,
    raw: new Uint8Array(32),
    end: 32,
  }];
  const table = {
    segments,
    segment(id) {
      return segments[id];
    },
  };
  segments[0].raw[0] = 0x02;
  segments[0].raw[4] = 0x01;

  // In bounds struct landing pad
  segments[1].raw[0] = 0x00;
  segments[1].raw[4] = 0x01;
  segments[1].raw[6] = 0x02;
  const p1 = unsafe(table, root(table));
  t.is(p1.typeBits, 0x00);
  t.is(p1.hi, (0x02<<16) | 0x01);
  t.deepEqual(p1.object, {segment: segments[1], position: 8});

  // In bounds list landing pad
  segments[1].raw.fill(0, 0, 8);
  segments[1].raw[0] = 0x01;
  segments[1].raw[4] = (3<<3) | 0x05;
  const p2 = unsafe(table, root(table));
  t.is(p2.typeBits, 0x01);
  t.is(p2.hi, (3<<3) | 0x05);
  t.deepEqual(p2.object, {segment: segments[1], position: 8});

  // Unexpected single-hop far-pointer landing pad
  segments[1].raw.fill(0, 0, 8);
  segments[1].raw[0] = 0x02;
  t.notThrows(() => unsafe(table, root(table)));

  // Unexpected double-hop far-pointer landing pad
  segments[1].raw.fill(0, 0, 8);
  segments[1].raw[0] = 0x04 | 0x02;
  t.notThrows(() => unsafe(table, root(table)));

  // Unexpected capability landing pad
  segments[1].raw.fill(0, 0, 8);
  segments[1].raw[0] = 0x03;
  t.notThrows(() => unsafe(table, root(table)));

  // Out of bounds landing pad
  segments[0].raw[0] = (4<<3) | 0x02;
  t.notThrows(() => unsafe(table, root(table)));
});

test("Double hop `unsafe`", t => {
  t.plan(13);

  const segments = [{
    id: 0,
    raw: new Uint8Array(8),
    end: 8,
  }, {
    id: 1,
    raw: new Uint8Array(16),
    end: 16,
  }, {
    id: 2,
    raw: new Uint8Array(32),
    end: 32,
  }];
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

  // In bounds struct tag
  segments[1].raw[8] = 0x00;
  segments[1].raw[12] = 0x01;
  segments[1].raw[14] = 0x03;
  const p1 = unsafe(table, root(table));
  t.is(p1.typeBits, 0x00);
  t.is(p1.hi, (0x03<<16) | 0x01);
  t.deepEqual(p1.object, {segment: segments[2], position: 0});

  // In bounds list tag
  segments[1].raw.fill(0, 8, 16);
  segments[1].raw[8] = 0x01;
  segments[1].raw[12] = (4<<3) | 0x05;
  const p2 = unsafe(table, root(table));
  t.is(p2.typeBits, 0x01);
  t.is(p2.hi, (4<<3) | 0x05);
  t.deepEqual(p2.object, {segment: segments[2], position: 0});

  // Unexpected far pointer tag
  segments[1].raw.fill(0, 8, 16);
  segments[1].raw[8] = 0x02;
  t.notThrows(() => unsafe(table, root(table)));

  // Unexpected capability tag
  segments[1].raw.fill(0, 8, 16);
  segments[1].raw[8] = 0x03;
  t.notThrows(() => unsafe(table, root(table)));

  // Unexpected struct landing pad
  segments[1].raw.fill(0, 0, 16);
  segments[1].raw[0] = 0x00;
  t.notThrows(() => unsafe(table, root(table)));

  // Unexpected list landing pad
  segments[1].raw.fill(0, 0, 16);
  segments[1].raw[0] = 0x01;
  t.notThrows(() => unsafe(table, root(table)));

  // Unexpected capability landing pad
  segments[1].raw.fill(0, 0, 16);
  segments[1].raw[0] = 0x03;
  t.notThrows(() => unsafe(table, root(table)));

  // Unexpected double-hop far-pointer landing pad
  segments[1].raw.fill(0, 0, 16);
  segments[1].raw[0] = 0x04 | 0x02;
  t.notThrows(() => unsafe(table, root(table)));

  // Out of bounds landing pad
  segments[0].raw.fill(0, 0, 8);
  segments[0].raw[0] = (2<<3) | 0x04 | 0x02;
  segments[0].raw[4] = 0x01;
  segments[1].raw.fill(0, 0, 16);
  segments[1].raw[0] = (4<<3) | 0x02; //TODO: This was working on segments[0]. That was a bug, right?
  t.notThrows(() => unsafe(table, root(table)));
});
