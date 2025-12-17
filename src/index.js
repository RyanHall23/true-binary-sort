// src/index.js

function toBuffer(value) {
  try {
    // Handle already-binary data
    if (Buffer.isBuffer(value)) return value;
    if (ArrayBuffer.isView(value)) return Buffer.from(value.buffer);
    if (value instanceof ArrayBuffer) return Buffer.from(value);

    // Special numeric optimization
    if (typeof value === 'number' && Number.isFinite(value) && !Number.isNaN(value)) {
      const b = Buffer.alloc(8);
      b.writeBigUInt64BE(BigInt(Math.floor(value)));
      return b;
    }

    // Boolean optimization
    if (typeof value === 'boolean') {
      return Buffer.from([value ? 1 : 0]);
    }

    // Universal approach: try stringification with circular reference handling
    const seen = new WeakSet();
    const stringified = JSON.stringify(value, (key, val) => {
      // Handle circular references
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) return '[Circular]';
        seen.add(val);
      }
      return val;
    });

    return Buffer.from(stringified, 'utf8');
  } catch {
    // Final fallback: convert to string with type info
    return Buffer.from(`[${value?.constructor?.name || typeof value}]${String(value).slice(0, 100)}`, 'utf8');
  }
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

function TrueBinarySort(value, options = {}) {
  const returnOriginal = options.returnOriginal === true;

  // Arrays
  if (Array.isArray(value)) {
    const items = value.map((v) => {
      const sorted = TrueBinarySort(v, options);
      const { bits, ones } = bitsZerosFirst(toBuffer(sorted));
      return { value: v, sorted, bits, ones };
    });

    const sorted = stableSort(items);
    return sorted.map(i => returnOriginal ? i.value : i.sorted);
  }

  // Maps
  if (value instanceof Map) {
    const items = Array.from(value.entries()).map(([k, v]) => {
      const sorted = TrueBinarySort(v, options);
      const { bits, ones } = bitsZerosFirst(toBuffer(sorted));
      return { key: k, value: v, sorted, bits, ones };
    });

    const sorted = stableSort(items);
    return new Map(sorted.map(i => returnOriginal ? [i.key, i.value] : [i.key, i.sorted]));
  }

  // Objects
  if (value && typeof value === 'object') {
    const items = Object.entries(value).map(([k, v]) => {
      const sorted = TrueBinarySort(v, options);
      const { bits, ones } = bitsZerosFirst(toBuffer(sorted));
      return { key: k, value: v, sorted, bits, ones };
    });

    const sorted = stableSort(items);
    return Object.fromEntries(sorted.map(i => returnOriginal ? [i.key, i.value] : [i.key, i.sorted]));
  }

  // Primitives
  return bitsZerosFirst(toBuffer(value)).bits;
}

module.exports = { TrueBinarySort };
module.exports.default = TrueBinarySort;
