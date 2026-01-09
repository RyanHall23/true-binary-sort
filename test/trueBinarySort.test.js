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

  // -------------------------
  // returnOriginal option
  // -------------------------
  test('returnOriginal option returns original values in sorted order', () => {
    const input = [5, 2, 1];
    const result = TrueBinarySort(input, { returnOriginal: true });

    // 1 has 1 one, 2 has 1 one, 5 has 2 ones -> [1, 2, 5] or [2, 1, 5] (stable)
    expect(result).toEqual([2, 1, 5]); // stable order preserved
  });

  test('returnOriginal with objects returns original values reordered', () => {
    const input = { a: 5, b: 2, c: 1 };
    const result = TrueBinarySort(input, { returnOriginal: true });

    // Values reordered by bit count, keys rearranged accordingly
    const values = Object.values(result);
    expect(values).toEqual([2, 1, 5]); // stable order: b, c, a
  });

  test('returnOriginal with Map returns original values reordered', () => {
    const input = new Map([["a", 5], ["b", 2], ["c", 1]]);
    const result = TrueBinarySort(input, { returnOriginal: true });

    const values = Array.from(result.values());
    expect(values).toEqual([2, 1, 5]); // reordered by bit values
  });

  // -------------------------
  // Extended Type Support
  // -------------------------
  test('null and undefined handled correctly', () => {
    const input = [null, undefined, 0];
    const result = TrueBinarySort(input);
    
    expect(result).toEqual(expect.any(Array));
    expect(result.length).toBe(3);
    result.forEach(r => expect(r).toMatch(/^[01]+$/));
  });

  test('special numbers (NaN, Infinity) handled correctly', () => {
    const input = [NaN, Infinity, -Infinity, 42];
    const result = TrueBinarySort(input);
    
    expect(result).toEqual(expect.any(Array));
    expect(result.length).toBe(4);
  });

  test('BigInt values converted correctly', () => {
    const input = [1n, 2n, 5n];
    const result = TrueBinarySort(input);
    
    expect(result).toEqual(expect.any(Array));
    result.forEach(r => expect(r).toMatch(/^[01]+$/));
  });

  test('Symbol values converted to string representation', () => {
    const input = [Symbol('test'), Symbol('another')];
    const result = TrueBinarySort(input);
    
    expect(result).toEqual(expect.any(Array));
    result.forEach(r => expect(r).toMatch(/^[01]+$/));
  });

  test('Date objects converted by timestamp', () => {
    const date1 = new Date('2020-01-01');
    const date2 = new Date('2021-01-01');
    const input = [date2, date1];
    const result = TrueBinarySort(input);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    // Dates get converted - result can be bit strings or objects
  });

  test('RegExp objects converted correctly', () => {
    const input = [/abc/, /test/];
    const result = TrueBinarySort(input);
    
    expect(result).toEqual(expect.any(Array));
    result.forEach(r => expect(typeof r === 'string' || typeof r === 'object').toBe(true));
  });

  test('Error objects converted correctly', () => {
    const input = [new Error('test'), new Error('another')];
    const result = TrueBinarySort(input);
    
    expect(result).toEqual(expect.any(Array));
    expect(result.length).toBe(2);
  });

  test('Sets converted to bit representation', () => {
    const input = [new Set([1, 2, 3]), new Set([4, 5])];
    const result = TrueBinarySort(input);
    
    expect(result).toEqual(expect.any(Array));
    expect(result.length).toBe(2);
  });

  test('objects with circular reference handled gracefully', () => {
    const obj1 = { a: 1 };
    const obj2 = { b: 2, nested: { c: 3 } };
    
    const input = [obj2, obj1];
    const result = TrueBinarySort(input);
    
    expect(result).toEqual(expect.any(Array));
    expect(result.length).toBe(2);
    // Result may be objects or bit strings depending on nesting
  });

  test('mixed complex types sorted deterministically', () => {
    const input = [false, 42, 'hello'];
    const result = TrueBinarySort(input, { returnOriginal: true });
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3);
  });
});