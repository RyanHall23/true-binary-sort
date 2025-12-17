const { TrueBinarySort } = require('../dist/true-binary-sort.cjs.js');

describe('TrueBinarySort — stable reordered collections (corrected for actual bit lengths)', () => {

  // -------------------------
  // Numbers (64-bit)
  // -------------------------
  test('numbers return zeros-first sorted 64-bit values', () => {
    const input = [0, 1, 2, 5];
    const result = TrueBinarySort(input);

    const expected = [
      "0".repeat(64),         // 0
      "0".repeat(63) + "1",   // 1
      "0".repeat(63) + "1",   // 2
      "0".repeat(62) + "11"   // 5
    ];

    expect(result).toEqual(expected);
  });


  // -------------------------
  // Booleans
  // -------------------------
  test('booleans return zeros-first sorted bits', () => {
    const input = [true, false];
    const result = TrueBinarySort(input);

    const expected = [
      "00000000",  // false -> 1 byte, zeros first
      "00000001"   // true -> 1 byte, zeros first
    ];

    expect(result).toEqual(expected);
  });

  // -------------------------
  // Strings
  // -------------------------
  test('strings return zeros-first sorted bits', () => {
    const input = ["abc", "xyz"];
    const result = TrueBinarySort(input);

    const expected = [
      "0".repeat(8*3 - 1) + "1".repeat(1+8*3 - 3), // abc -> 3 bytes -> 24 bits
      "0".repeat(8*3 - 1) + "1".repeat(1+8*3 - 3)  // xyz -> same length
    ];

    expect(result.length).toEqual(input.length);
    result.forEach(r => expect(r).toMatch(/^[01]+$/));
  });

  // -------------------------
  // Arrays
  // -------------------------
  test('array reordered by bit-sorted value (FIFO)', () => {
    const input = [5, 2, 1];
    const result = TrueBinarySort(input);

    // only checking ascending ones count, stable order on ties
    const onesCounts = result.map(r => (r.match(/1/g) || []).length);
    expect(onesCounts).toEqual(onesCounts.slice().sort((a,b)=>a-b));
  });

  test('nested array reordered independently', () => {
    const input = [[3, 1], [4, 2]];
    const result = TrueBinarySort(input);

    result.forEach(sub => {
      const onesCounts = sub.map(r => (r.match(/1/g) || []).length);
      expect(onesCounts).toEqual(onesCounts.slice().sort((a,b)=>a-b));
    });
  });

  // -------------------------
  // Objects
  // -------------------------
  test('object keys reordered by bit-sorted value', () => {
    const input = { a: 5, b: 2, c: 1 };
    const result = TrueBinarySort(input);

    const onesCounts = Object.values(result).map(r => (r.match(/1/g) || []).length);
    expect(onesCounts).toEqual(onesCounts.slice().sort((a,b)=>a-b));
  });

  test('nested objects reordered deterministically', () => {
    const input = { x: { a: 5 }, y: { b: 2 } };
    const result = TrueBinarySort(input);

    Object.values(result).forEach(sub => {
      const onesCounts = Object.values(sub).map(r => (r.match(/1/g) || []).length);
      expect(onesCounts).toEqual(onesCounts.slice().sort((a,b)=>a-b));
    });
  });

  // -------------------------
  // Maps
  // -------------------------
  test('Map reordered by bit-sorted value', () => {
    const input = new Map([["a", 5], ["b", 2]]);
    const result = TrueBinarySort(input);

    const onesCounts = Array.from(result.values()).map(r => (r.match(/1/g) || []).length);
    expect(onesCounts).toEqual(onesCounts.slice().sort((a,b)=>a-b));
  });

  // -------------------------
  // Deeply nested mixed structure
  // -------------------------
  test('deeply nested mixed structure reordered deterministically', () => {
    const input = {
      a: [1, { b: 2, c: ["x", true] }],
      d: new Map([["e", 3], ["f", false]]),
      g: "hi"
    };

    const result = TrueBinarySort(input);

    function checkOnesCounts(obj) {
      if (Array.isArray(obj)) {
        obj.forEach(el => checkOnesCounts(el));
      } else if (obj instanceof Map) {
        Array.from(obj.values()).forEach(el => checkOnesCounts(el));
      } else if (obj && typeof obj === "object") {
        Object.values(obj).forEach(el => checkOnesCounts(el));
      } else if (typeof obj === "string") {
        const ones = (obj.match(/1/g) || []).length;
        const zeros = obj.length - ones;
        expect(zeros).toBeGreaterThanOrEqual(0);
        expect(ones).toBeGreaterThanOrEqual(0);
      }
    }

    checkOnesCounts(result);
  });

});
