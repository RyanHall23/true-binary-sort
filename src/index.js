// src/index.js

function toBuffer(value) {
  try {
    if (Buffer.isBuffer(value)) return value;
    if (ArrayBuffer.isView(value)) return Buffer.from(value.buffer);
    if (value instanceof ArrayBuffer) return Buffer.from(value);

    if (typeof value === 'number') {
      const b = Buffer.alloc(8);
      b.writeBigUInt64BE(BigInt(value)); // <--- fix here
      return b;
    }

    if (typeof value === 'boolean') {
      return Buffer.from([value ? 1 : 0]);
    }

    if (typeof value === 'function') {
      return Buffer.from(value.toString(), 'utf8');
    }

    return Buffer.from(JSON.stringify(value), 'utf8');
  } catch {
    return Buffer.from(String(value), 'utf8');
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
    .sort((a, b) => {
      if (a.ones !== b.ones) return a.ones - b.ones;
      if (a.bits !== b.bits) return a.bits.localeCompare(b.bits);
      return a.index - b.index;
    });
}

function TrueBinarySort(value) {
  // Arrays
  if (Array.isArray(value)) {
    const items = value.map(v => {
      const sorted = TrueBinarySort(v);
      const { bits, ones } = bitsZerosFirst(toBuffer(sorted));
      return { value: sorted, bits, ones };
    });

    return stableSort(items).map(i => i.value);
  }

  // Maps
  if (value instanceof Map) {
    const items = Array.from(value.entries()).map(([k, v]) => {
      const sorted = TrueBinarySort(v);
      const { bits, ones } = bitsZerosFirst(toBuffer(sorted));
      return { value: [k, sorted], bits, ones };
    });

    return new Map(stableSort(items).map(i => i.value));
  }

  // Objects
  if (value && typeof value === 'object') {
    const items = Object.entries(value).map(([k, v]) => {
      const sorted = TrueBinarySort(v);
      const { bits, ones } = bitsZerosFirst(toBuffer(sorted));
      return { value: [k, sorted], bits, ones };
    });

    return Object.fromEntries(stableSort(items).map(i => i.value));
  }

  // Primitives
  return bitsZerosFirst(toBuffer(value)).bits;
}

module.exports = { TrueBinarySort };
module.exports.default = TrueBinarySort;
