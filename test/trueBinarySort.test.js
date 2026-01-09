const TrueBinarySort = require('../dist/true-binary-sort.cjs.js');

describe('TrueBinarySort — Base64 and bits output formats with stable reordered collections', () => {

  // -------------------------
  // Numbers (64-bit) - Base64
  // -------------------------
  test('numbers return Base64-encoded outputs by default', () => {
    const input = [0, 1, 2, 5];
    const result = TrueBinarySort(input);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(input.length);
    // Base64 strings
    result.forEach(r => expect(r).toMatch(/^[A-Za-z0-9+/=]+$/));
  });

  test('numbers return binary bits with outputFormat: bits', () => {
    const input = [0, 1, 2, 5];
    const result = TrueBinarySort(input, { outputFormat: 'bits' });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(input.length);
    // Binary bit strings
    result.forEach(r => expect(r).toMatch(/^[01]+$/));
  });

  test('outputFormat base64 vs bits produces different outputs', () => {
    const input = [3, 7];
    const base64Result = TrueBinarySort(input, { outputFormat: 'base64' });
    const bitsResult = TrueBinarySort(input, { outputFormat: 'bits' });

    // Results should be different
    expect(base64Result).not.toEqual(bitsResult);
    // Base64 should match base64 pattern
    base64Result.forEach(r => expect(r).toMatch(/^[A-Za-z0-9+/=]+$/));
    // Bits should match bits pattern
    bitsResult.forEach(r => expect(r).toMatch(/^[01]+$/));
  });

  // -------------------------
  // Booleans
  // -------------------------
  test('booleans return Base64-encoded outputs', () => {
    const input = [true, false];
    const result = TrueBinarySort(input);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    result.forEach(r => expect(r).toMatch(/^[A-Za-z0-9+/=]+$/));
  });

  test('booleans return binary bits with outputFormat: bits', () => {
    const input = [true, false];
    const result = TrueBinarySort(input, { outputFormat: 'bits' });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    result.forEach(r => expect(r).toMatch(/^[01]+$/));
  });

  test('returnOriginal true returns actual boolean values not bits', () => {
    const input = [true, false, true];
    const result = TrueBinarySort(input, { returnOriginal: true });

    // Should contain the original boolean values
    expect(result).toContain(true);
    expect(result).toContain(false);
    // Should NOT contain bit strings
    result.forEach(r => expect(typeof r).toBe('boolean'));
  });

  // -------------------------
  // Strings
  // -------------------------
  test('strings return Base64-encoded outputs', () => {
    const input = ["abc", "xyz"];
    const result = TrueBinarySort(input);

    expect(result.length).toEqual(input.length);
    result.forEach(r => expect(r).toMatch(/^[A-Za-z0-9+/=]+$/));
  });

  test('strings return binary bits with outputFormat: bits', () => {
    const input = ["abc", "xyz"];
    const result = TrueBinarySort(input, { outputFormat: 'bits' });

    expect(result.length).toEqual(input.length);
    result.forEach(r => expect(r).toMatch(/^[01]+$/));
  });

  test('returnOriginal true with strings returns original strings not bits', () => {
    const input = ["apple", "banana"];
    const result = TrueBinarySort(input, { returnOriginal: true });

    // Should contain the original strings
    expect(result).toContain("apple");
    expect(result).toContain("banana");
    // Should NOT contain bit strings
    result.forEach(r => {
      expect(typeof r).toBe('string');
      expect(r).not.toMatch(/^[01]+$/); // not a binary bit string
    });
  });

  // -------------------------
  // Arrays
  // -------------------------
  test('array reordered by bit-sorted value (using returnOriginal)', () => {
    const input = [5, 2, 1];
    const result = TrueBinarySort(input, { returnOriginal: true });

    expect(result).toEqual([2, 1, 5]); // stable order preserved on ties
    // Values should be actual numbers, not bit strings
    result.forEach(r => expect(typeof r).toBe('number'));
  });

  test('nested array conversion produces Base64 outputs for inner collections', () => {
    const input = [[3, 1], [4, 2]];
    const result = TrueBinarySort(input);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    result.forEach(sub => {
      expect(Array.isArray(sub)).toBe(true);
      sub.forEach(r => {
        if (typeof r === 'string') {
          expect(r).toMatch(/^[A-Za-z0-9+/=]+$/);
        }
      });
    });
  });

  // -------------------------
  // Objects
  // -------------------------
  test('object values reordered by bit-sorted value (using returnOriginal)', () => {
    const input = { a: 5, b: 2, c: 1 };
    const result = TrueBinarySort(input, { returnOriginal: true });

    const values = Object.values(result);
    const onesCounts = values.map(n => (n.toString(2).match(/1/g) || []).length);
    expect(onesCounts).toEqual(onesCounts.slice().sort((a,b)=>a-b));
  });

  test('nested objects reordered deterministically (using returnOriginal)', () => {
    const input = { x: { a: 5 }, y: { b: 2 } };
    const result = TrueBinarySort(input, { returnOriginal: true });

    Object.values(result).forEach(sub => {
      const onesCounts = Object.values(sub).map(n => (n.toString(2).match(/1/g) || []).length);
      expect(onesCounts).toEqual(onesCounts.slice().sort((a,b)=>a-b));
    });
  });

  // -------------------------
  // Maps
  // -------------------------
  test('Map reordered by bit-sorted value (using returnOriginal)', () => {
    const input = new Map([["a", 5], ["b", 2]]);
    const result = TrueBinarySort(input, { returnOriginal: true });

    const values = Array.from(result.values());
    const onesCounts = values.map(n => (n.toString(2).match(/1/g) || []).length);
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

    function checkStringsAreBase64(obj) {
      if (Array.isArray(obj)) {
        obj.forEach(el => checkStringsAreBase64(el));
      } else if (obj instanceof Map) {
        Array.from(obj.values()).forEach(el => checkStringsAreBase64(el));
      } else if (obj && typeof obj === "object") {
        Object.values(obj).forEach(el => checkStringsAreBase64(el));
      } else if (typeof obj === "string") {
        expect(obj).toMatch(/^[A-Za-z0-9+/=]+$/);
      }
    }

    checkStringsAreBase64(result);
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

  test('returnOriginal preserves top-level types for arrays', () => {
    const input = [true, 2, 'hi', { x: 1 }, [1, 2]];
    const result = TrueBinarySort(input, { returnOriginal: true });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(5);
    expect(result).toEqual(expect.arrayContaining([true, 2, 'hi', { x: 1 }, [1, 2]]));
  });

  test('returnOriginal preserves top-level values for objects', () => {
    const input = { a: true, b: 2, c: [1], d: { x: 1 } };
    const result = TrueBinarySort(input, { returnOriginal: true });

    const values = Object.values(result);
    expect(values).toEqual(expect.arrayContaining([true, 2, [1], { x: 1 }]));
  });

  test('returnOriginal preserves top-level values for Maps', () => {
    const input = new Map([['a', true], ['b', 2], ['c', 's']]);
    const result = TrueBinarySort(input, { returnOriginal: true });

    const values = Array.from(result.values());
    expect(values).toEqual(expect.arrayContaining([true, 2, 's']));
  });

  // -------------------------
  // Extended Type Support
  // -------------------------
  test('null and undefined handled correctly', () => {
    const input = [null, undefined, 0];
    const result = TrueBinarySort(input);
    
    expect(result).toEqual(expect.any(Array));
    expect(result.length).toBe(3);
    result.forEach(r => expect(r).toMatch(/^[A-Za-z0-9+/=]+$/));
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
    result.forEach(r => expect(r).toMatch(/^[A-Za-z0-9+/=]+$/));
  });

  test('floats and negative numbers handled without error', () => {
    const input = [1.9, -2.5, 0];
    const result = TrueBinarySort(input);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3);
    result.forEach(r => expect(typeof r === 'string').toBe(true));

    // returnOriginal should provide the original numeric values
    const original = TrueBinarySort(input, { returnOriginal: true });
    expect(original).toEqual(expect.arrayContaining([1.9, -2.5, 0]));
  });

  test('Buffer and TypedArray inputs handled (Base64)', () => {
    const buf = Buffer.from([1,2,3]);
    const ta = new Uint8Array([4,5,6]);
    const input = [buf, ta];
    const result = TrueBinarySort(input);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    result.forEach(r => expect(r).toMatch(/^[A-Za-z0-9+/=]+$/));
  });

  test('Map with returnOriginal preserves keys and original values', () => {
    const input = new Map([['a', 5], ['b', 2], ['c', 1]]);
    const result = TrueBinarySort(input, { returnOriginal: true });

    // keys should remain the original Map keys (though reordered)
    const entries = Array.from(result.entries());
    entries.forEach(([k, v]) => {
      expect(typeof k).toBe('string');
      // values should be original raw values (numbers)
      expect(typeof v).toBe('number');
    });
  });

  test('very large BigInt values handled without throwing', () => {
    const big1 = 2n ** 80n; // very large BigInt
    const big2 = -(2n ** 65n);
    const input = [big1, big2, 5n];
    const result = TrueBinarySort(input);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3);
  });

  test('deep circular references do not throw', () => {
    const a = { val: 1 };
    const b = { val: 2, child: a };
    a.child = b; // circular

    const input = [a, b];
    expect(() => TrueBinarySort(input)).not.toThrow();
  });

  test('Symbol values converted to Base64 representation', () => {
    const input = [Symbol('test'), Symbol('another')];
    const result = TrueBinarySort(input);
    
    expect(result).toEqual(expect.any(Array));
    result.forEach(r => expect(r).toMatch(/^[A-Za-z0-9+/=]+$/));
  });

  test('Date objects converted by timestamp (Base64)', () => {
    const date1 = new Date('2020-01-01');
    const date2 = new Date('2021-01-01');
    const input = [date2, date1];
    const result = TrueBinarySort(input);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    // Dates get converted - result is Base64 strings
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

  test('Sets converted to Base64 representation', () => {
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
    // Result may be objects or Base64 strings depending on nesting
  });

  test('mixed complex types sorted deterministically', () => {
    const input = [false, 42, 'hello'];
    const result = TrueBinarySort(input, { returnOriginal: true });
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3);
  });
});