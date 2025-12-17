# TrueBinarySort

> Sorts the bits of anything. Truly. Pointlessly.

**TrueBinarySort** converts any input into binary, sorts all bits so that `0`s come first, and returns the result as a string. Collections (arrays, objects, Maps) are reordered based on their bit data.

It is:
- Deterministic
- Universal (numbers, strings, buffers, objects, arrays, booleans, functions, etc.)
- Stable (preserves order for elements with identical bit values)
- Totally pointless

## Installation

```bash
npm install true-binary-sort
```

## Universal Type Support

**TrueBinarySort** now handles virtually any JavaScript value:

- **Primitives**: numbers, strings, booleans, symbols, BigInt
- **Special values**: null, undefined, NaN, Infinity
- **Objects**: plain objects, arrays, Maps, Sets
- **Built-ins**: Date, RegExp, Error, Promise
- **Functions**: regular functions, arrow functions, async functions
- **Binary**: Buffer, ArrayBuffer, TypedArrays
- **DOM**: HTML elements (browsers)
- **Circular references**: automatically detected and handled

## Usage

### Basic Usage - Return Bit Strings

```javascript
import TrueBinarySort from 'true-binary-sort';

const input = [0, 1, 2, 5];
const output = TrueBinarySort(input);
console.log(output);
// ["0000...0000", "0000...0001", "0000...0001", "0000...0011"]
// Sorted by bit count: 0 (0 ones), 1 (1 one), 2 (1 one), 5 (2 ones)
```

### Options

**`returnOriginal`** (boolean) - Return original input values instead of bit strings, reordered by their bit-sort order.

```javascript
TrueBinarySort(input, { returnOriginal: true })
```

---

## Detailed Examples

### Example 1: Sorting Numbers by Bit Count

```javascript
import TrueBinarySort from 'true-binary-sort';

// Bit representation (64-bit integers):
// 3 = 0000...0011  (2 ones)
// 1 = 0000...0001  (1 one)
// 7 = 0000...0111  (3 ones)

const input = [3, 1, 7];

// Get bit-sorted strings
const bitStrings = TrueBinarySort(input);
// Result: ["0000...0001", "0000...0011", "0000...0111"]
// Ordered by ones count: 1 < 2 < 3

// Get original values in bit-sorted order
const sorted = TrueBinarySort(input, { returnOriginal: true });
// Result: [1, 3, 7]
```

### Example 2: Sorting Objects by Value Bit Count

```javascript
import TrueBinarySort from 'true-binary-sort';

const user = {
  name: 'Alice',      // Many bits (UTF-8 encoded)
  age: 25,            // Fewer bits
  active: true        // 1 byte
};

// Get bit-sorted object (keys reordered by value bit count)
const sorted = TrueBinarySort(user, { returnOriginal: true });
// Result: { active: true, age: 25, name: 'Alice' }
// Ordered by bit count of values: boolean < number < string
```

### Example 3: Sorting Arrays of Mixed Types

```javascript
import TrueBinarySort from 'true-binary-sort';

const mixed = [false, 2, 'hi', true, 1];

// false = 00000000     (0 ones)
// 1     = 0000...0001  (1 one)
// 2     = 0000...0010  (1 one)
// true  = 00000001     (1 one)
// 'hi'  = 0110100001101001 (8 ones)

const sorted = TrueBinarySort(mixed, { returnOriginal: true });
// Result: [false, 2, 1, true, 'hi']
// Reordered by bit ones count: 0 ones, then 1 one (stable order), then 8 ones
```

---

## How It Works

1. **Convert** - Each input is converted to a Buffer (numbers as 64-bit, strings as UTF-8, etc.)
2. **Count Bits** - All bits are counted; returns "0" * zeros + "1" * ones
3. **Sort** - Collections are sorted by:
   - Primary: count of `1` bits (ascending)
   - Secondary: bit string comparison (lexicographic)
   - Tertiary: original order (stable sort)
4. **Return** - Either bit strings or original values in sorted order

## License

MIT
