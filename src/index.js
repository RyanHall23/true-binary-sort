// src/index.js

function toUint8Array(value) {
  // Convert a wide range of JS values into a Uint8Array representation.
  // This avoids Node Buffer usage so the library works in browsers without polyfills.

  // Numbers (store as 64-bit big-endian integer of the floored value)
  if (typeof value === 'number' && Number.isFinite(value) && !Number.isNaN(value)) {
    const arr = new Uint8Array(8);
    const view = new DataView(arr.buffer);
    view.setBigUint64(0, BigInt(Math.floor(value)), false); // big-endian
    return arr;
  }

  // BigInt (64-bit BE)
  if (typeof value === 'bigint') {
    const arr = new Uint8Array(8);
    const view = new DataView(arr.buffer);
    view.setBigUint64(0, value, false);
    return arr;
  }

  // Boolean
  if (typeof value === 'boolean') {
    return new Uint8Array([value ? 1 : 0]);
  }

  // Null / undefined
  if (value === null || typeof value === 'undefined') {
    return new Uint8Array([0]);
  }

  // ArrayBuffer / TypedArray / Node Buffer (Buffer is subclass of Uint8Array)
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);

  // Strings -> UTF-8
  if (typeof value === 'string') {
    return new TextEncoder().encode(value);
  }

  // Objects (safe stringify with circular detection)
  if (typeof value === 'object') {
    try {
      const seen = new WeakSet();
      const stringified = JSON.stringify(value, (k, v) => {
        if (typeof v === 'object' && v !== null) {
          if (seen.has(v)) return '[Circular]';
          seen.add(v);
        }
        return v;
      });
      return new TextEncoder().encode(stringified);
    } catch (e) {
      return new TextEncoder().encode(String(value));
    }
  }

  // Symbols, functions, etc.
  return new TextEncoder().encode(String(value));
}

function bitsZerosFirst(buf) {
  let zeros = 0;
  let ones = 0;

  for (const byte of buf) {
    for (let i = 7; i >= 0; i--) {
      ((byte >> i) & 1) === 0 ? zeros++ : ones++;
    }
  }

  return {
    bits: '0'.repeat(zeros) + '1'.repeat(ones),
    ones
  };
}

function stableSort(items) {
  return items
    .map((item, index) => ({ ...item, index }))
    .sort((a, b) => a.ones - b.ones || a.bits.localeCompare(b.bits) || a.index - b.index);
}

export function TrueBinarySort(value, options = {}, _seen = new WeakSet()) {
  const returnOriginal = options.returnOriginal === true;

  // Detect circular references early and avoid infinite recursion.
  if (value && typeof value === 'object') {
    if (_seen.has(value)) {
      return bitsZerosFirst(toUint8Array('[Circular]')).bits;
    }
    _seen.add(value);
  }

  // Treat binary-like objects (ArrayBuffer, TypedArrays, Node Buffer) as primitives
  // so they are represented as bit-strings instead of being iterated as objects.
  if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
    return bitsZerosFirst(toUint8Array(value)).bits;
  }

  // Arrays
  if (Array.isArray(value)) {
    const items = value.map((v) => {
      const sorted = TrueBinarySort(v, options, _seen);
      // Always compute bits from the original value `v` so that sorting
      // is based on the source data (not on a possibly transformed `sorted`).
      const { bits, ones } = bitsZerosFirst(toUint8Array(v));
      return { value: v, sorted, bits, ones };
    });

    const sorted = stableSort(items);
    return sorted.map(i => returnOriginal ? i.value : i.sorted);
  }

  // Maps
  if (value instanceof Map) {
    const items = Array.from(value.entries()).map(([k, v]) => {
      const sorted = TrueBinarySort(v, options, _seen);
      // Use the original value `v` when calculating bits for stable ordering.
      const { bits, ones } = bitsZerosFirst(toUint8Array(v));
      return { key: k, value: v, sorted, bits, ones };
    });

    const sorted = stableSort(items);
    return new Map(sorted.map(i => returnOriginal ? [i.key, i.value] : [i.key, i.sorted]));
  }

  // Objects
  if (value && typeof value === 'object') {
    const items = Object.entries(value).map(([k, v]) => {
      const sorted = TrueBinarySort(v, options, _seen);
      // Compute bits from the original property value so returned original
      // object entries remain the actual original values when requested.
      const { bits, ones } = bitsZerosFirst(toUint8Array(v));
      return { key: k, value: v, sorted, bits, ones };
    });

    const sorted = stableSort(items);
    return Object.fromEntries(sorted.map(i => returnOriginal ? [i.key, i.value] : [i.key, i.sorted]));
  }

  // Primitives
  return bitsZerosFirst(toUint8Array(value)).bits;
}


export default TrueBinarySort;
