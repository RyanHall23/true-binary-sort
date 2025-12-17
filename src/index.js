// src/index.js

function toBuffer(value) {
  if (Buffer.isBuffer(value)) return value;
  if (ArrayBuffer.isView(value)) return Buffer.from(value.buffer);
  if (value instanceof ArrayBuffer) return Buffer.from(value);
  if (typeof value === 'number') {
    const buf = Buffer.alloc(1);
    buf.writeUInt8(value & 0xff, 0);
    return buf;
  }
  if (typeof value === 'boolean') {
    return Buffer.from([value ? 1 : 0]);
  }
  // everything else -> string bytes
  return Buffer.from(String(value), 'utf8');
}

// deterministic zeros-first sort
function sortBitsZerosFirst(buf) {
  let zeros = 0, ones = 0;
  for (const byte of buf) {
    for (let i = 7; i >= 0; i--) {
      ((byte >> i) & 1) ? ones++ : zeros++;
    }
  }
  return '0'.repeat(zeros) + '1'.repeat(ones);
}

function TrueBinarySort(value) {
  if (Array.isArray(value)) {
    return value.map(item => TrueBinarySort(item));
  }

  if (value instanceof Map) {
    const result = new Map();
    for (const [k, v] of value.entries()) {
      result.set(k, TrueBinarySort(v));
    }
    return result;
  }

  if (value && typeof value === 'object' && !(value instanceof Buffer)) {
    const result = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = TrueBinarySort(v);
    }
    return result;
  }

  if (typeof value === 'function') {
    return sortBitsZerosFirst(Buffer.from(value.toString(), 'utf8'));
  }

  // primitives
  return sortBitsZerosFirst(toBuffer(value));
}

module.exports = { TrueBinarySort };
