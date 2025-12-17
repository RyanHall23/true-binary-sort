const { TrueBinarySort } = require('../dist/true-binary-sort.cjs.js');

describe('TrueBinarySort', () => {

  // -------------------------
  // Numbers
  // -------------------------
  test('numbers return deterministic zeros-first sorted bits', () => {
    const input = [0, 1, 2, 5];
    const result = TrueBinarySort(input);

    const expected = [
      "00000000", // 0 -> 00000000
      "00000001", // 1 -> 00000001
      "00000001", // 2 -> 00000010 -> sorted -> 00000001
      "00000011"  // 5 -> 00000101 -> sorted -> 00000011
    ];

    expect(result).toEqual(expected);
  });

  // -------------------------
  // Booleans
  // -------------------------
  test('booleans return deterministic zeros-first sorted bits', () => {
    const input = [true, false];
    const result = TrueBinarySort(input);

    const expected = [
      // "true" -> 4 bytes -> 32 bits
      "00000001",
      // "false" -> 5 bytes -> 40 bits
      "00000000"
    ];

    expect(result).toEqual(expected);
  });

  // -------------------------
  // Strings
  // -------------------------
  test('strings return deterministic zeros-first sorted bits', () => {
    const input = ["abc", "xyz"];
    const result = TrueBinarySort(input);

    const expected = [
      // "abc" -> 3 bytes -> 24 bits
      "000000000000001111111111",
      // "xyz" -> 3 bytes -> 24 bits
      "000000000011111111111111"
    ];

    expect(result).toEqual(expected);
  });

  // -------------------------
  // Arrays
  // -------------------------
  test('arrays return deterministic zeros-first sorted bits per index', () => {
    const input = [5, 2, 1];
    const result = TrueBinarySort(input);

    const expected = [
      "00000011", // 5 -> 00000101 -> sorted
      "00000001", // 2 -> 00000010 -> sorted
      "00000001"  // 1
    ];

    expect(result).toEqual(expected);
  });

  // Nested arrays
  test('nested arrays return deterministic zeros-first sorted bits', () => {
    const input = [[5, 2], [1, 7]];
    const result = TrueBinarySort(input);

    const expected = [
      ["00000011", "00000001"], // first sub-array
      ["00000001", "00000111"]  // second sub-array
    ];

    expect(result).toEqual(expected);
  });

  // -------------------------
  // Objects
  // -------------------------
  test('objects return deterministic zeros-first sorted bits per key', () => {
    const input = { a: 5, b: 2, c: 1 };
    const result = TrueBinarySort(input);

    const expected = {
      a: "00000011",
      b: "00000001",
      c: "00000001"
    };

    expect(result).toEqual(expected);
  });

  // Nested objects
  test('nested objects return deterministic zeros-first sorted bits', () => {
    const input = { x: { a: 5 }, y: { b: 2 } };
    const result = TrueBinarySort(input);

    const expected = {
      x: { a: "00000011" },
      y: { b: "00000001" }
    };

    expect(result).toEqual(expected);
  });

  // -------------------------
  // Maps
  // -------------------------
  test('Maps return deterministic zeros-first sorted bits per key', () => {
    const input = new Map([["a", 5], ["b", 2]]);
    const result = TrueBinarySort(input);

    const expected = new Map([
      ["a", "00000011"],
      ["b", "00000001"]
    ]);

    expect(Array.from(result.entries())).toEqual(Array.from(expected.entries()));
  });

  // -------------------------
  // Buffers
  // -------------------------
  test('buffers return deterministic zeros-first sorted bits', () => {
    const input = Buffer.from([1,2,3]);
    const result = TrueBinarySort(input);

    const expected = {"0": "00000001", "1": "00000001", "2": "00000011"}; // 3 bytes -> zeros first

    expect(result).toEqual(expected);
  });

  // -------------------------
  // Functions
  // -------------------------
  test('functions return deterministic zeros-first sorted bits', () => {
    const fn = () => {};
    const result = TrueBinarySort(fn);

    // function.toString() -> bytes -> zeros first
    // we just check that zeros come first
    expect(result.startsWith("0000")).toBe(true);
  });

  // -------------------------
  // Deeply nested mixed structure
  // -------------------------
test('deeply nested mixed structure deterministic zeros-first sorted bits', () => {
  const input = {
    a: [1, { b: 2, c: ["x", true] }],
    d: new Map([["e", 3], ["f", false]]),
    g: "hi"
  };
  const result = TrueBinarySort(input);

  const expected = {
    a: [
      "00000001", 
      { b: "00000001", c: ["00001111", "00000001"] } // "x" -> 00001111, true -> 00000001
    ],
    d: new Map([
      ["e", "00000011"], // 3 -> 00000011
      ["f", "00000000"]  // false -> 00000000
    ]),
    g: "0000000001111111" // "hi" -> 2 bytes -> zeros first
  };

  const resultNormalized = {
    ...result,
    d: Array.from(result.d.entries())
  };
  const expectedNormalized = {
    ...expected,
    d: Array.from(expected.d.entries())
  };

  expect(resultNormalized).toEqual(expectedNormalized);
});


});
