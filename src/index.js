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

function TrueBinarySort(value, options = {}, _seen = new WeakSet()) {
  const returnOriginal = options.returnOriginal === true;
  const outputFormat = options.outputFormat || 'base64'; // 'base64' | 'bits'

  // Helper: convert a binary string (zeros then ones) to a Uint8Array
  function binaryStringToUint8Array(binStr) {
    const arr = new Uint8Array(Math.ceil(binStr.length / 8));
    for (let i = 0; i < arr.length; i++) {
      arr[i] = parseInt(binStr.slice(i * 8, i * 8 + 8).padEnd(8, '0'), 2);
    }
    return arr;
  }

  // Helper: convert Uint8Array to Base64
  function uint8ToBase64(uint8) {
    if (typeof Buffer !== 'undefined') {
      // Node.js
      return Buffer.from(uint8).toString('base64');
    } else {
      // Browser
      let binary = '';
      for (let i = 0; i < uint8.length; i++) {
        binary += String.fromCharCode(uint8[i]);
      }
      return btoa(binary);
    }
  }

  // Detect circular references early and avoid infinite recursion.
  if (value && typeof value === 'object') {
    if (_seen.has(value)) {
      const bits = bitsZerosFirst(toUint8Array('[Circular]')).bits;
      if (returnOriginal) return '[Circular]';
      return outputFormat === 'bits' ? bits : uint8ToBase64(binaryStringToUint8Array(bits));
    }
    _seen.add(value);
  }

  // Treat binary-like objects (ArrayBuffer, TypedArrays, Node Buffer) as primitives
  // so they are represented as bit-strings instead of being iterated as objects.
  if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
    const bits = bitsZerosFirst(toUint8Array(value)).bits;
    if (returnOriginal) return value;
    return outputFormat === 'bits' ? bits : uint8ToBase64(binaryStringToUint8Array(bits));
  }

  // Arrays
  if (Array.isArray(value)) {
    const items = value.map((v) => {
      const sorted = TrueBinarySort(v, options, _seen);
      const { bits, ones } = bitsZerosFirst(toUint8Array(v));
      return { value: v, sorted, bits, ones };
    });
    const sorted = stableSort(items);
    function toOutputRecursive(val) {
      if (Array.isArray(val)) {
        return val.map(toOutputRecursive);
      }
      if (val && typeof val === 'object' && !(val instanceof Uint8Array)) {
        return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, toOutputRecursive(v)]));
      }
      if (typeof val === 'string') {
        return outputFormat === 'bits' ? val : uint8ToBase64(binaryStringToUint8Array(val));
      }
      // For primitives, convert to string first
      const bitStr = String(val);
      return outputFormat === 'bits' ? bitStr : uint8ToBase64(binaryStringToUint8Array(bitStr));
    }
    return sorted.map(i => {
      if (returnOriginal) return i.value;
      return toOutputRecursive(i.sorted);
    });
  }

  // Maps
  if (value instanceof Map) {
    const items = Array.from(value.entries()).map(([k, v]) => {
      const sorted = TrueBinarySort(v, options, _seen);
      const { bits, ones } = bitsZerosFirst(toUint8Array(v));
      return { key: k, value: v, sorted, bits, ones };
    });
    const sorted = stableSort(items);
    return new Map(sorted.map(i => {
      if (returnOriginal) return [i.key, i.value];
      const bitStr = i.sorted;
      return [i.key, outputFormat === 'bits' ? bitStr : uint8ToBase64(binaryStringToUint8Array(bitStr))];
    }));
  }

  // Objects
  if (value && typeof value === 'object' && !(value instanceof Map)) {
    const items = Object.entries(value).map(([k, v]) => {
      const sorted = TrueBinarySort(v, options, _seen);
      const { bits, ones } = bitsZerosFirst(toUint8Array(v));
      return { key: k, value: v, sorted, bits, ones };
    });
    const sorted = stableSort(items);
    function toOutputObjRecursive(val) {
      if (Array.isArray(val)) {
        return val.map(toOutputObjRecursive);
      }
      if (val && typeof val === 'object' && !(val instanceof Uint8Array)) {
        return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, toOutputObjRecursive(v)]));
      }
      if (typeof val === 'string') {
        return outputFormat === 'bits' ? val : uint8ToBase64(binaryStringToUint8Array(val));
      }
      const bitStr = String(val);
      return outputFormat === 'bits' ? bitStr : uint8ToBase64(binaryStringToUint8Array(bitStr));
    }
    return Object.fromEntries(sorted.map(i => {
      if (returnOriginal) return [i.key, i.value];
      return [i.key, toOutputObjRecursive(i.sorted)];
    }));
  }

  // Primitives
  const bits = bitsZerosFirst(toUint8Array(value)).bits;
  if (returnOriginal) return value;
  return outputFormat === 'bits' ? bits : uint8ToBase64(binaryStringToUint8Array(bits));
}


export default TrueBinarySort;
