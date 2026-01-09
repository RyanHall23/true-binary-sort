# TrueBinarySort

> Sorts the bits of anything. Truly. Pointlessly.

**TrueBinarySort** converts any input into binary, sorts all bits so that `0`s come first, and returns the result as a Base64 string. Collections (arrays, objects, Maps) are reordered based on their bit data.

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

### Basic Usage - Return Base64

```javascript
import TrueBinarySort from 'true-binary-sort';

const input = [0, 1, 2, 5];
const output = TrueBinarySort(input);
console.log(output);
// ["...base64...", "...base64...", "...base64...", "...base64..."]
// Sorted by bit count: 0 (0 ones), 1 (1 one), 2 (1 one), 5 (2 ones)
```

### Return Binary Bits

```javascript
const input = [0, 1, 2, 5];
const output = TrueBinarySort(input, { outputFormat: 'bits' });
console.log(output);
// ["0000...0000", "0000...0001", "0000...0001", "0000...0011"]
// Sorted by bit count: 0 (0 ones), 1 (1 one), 2 (1 one), 5 (2 ones)
```

### Options

**`returnOriginal`** (boolean) - Return original input values instead of Base64 strings, reordered by their bit-sort order.

**`outputFormat`** (string) - Output format for sorted bits. Options: `'base64'` (default) or `'bits'` (raw binary string: 0s then 1s).

```javascript
TrueBinarySort(input, { returnOriginal: true })
TrueBinarySort(input, { outputFormat: 'bits' })
TrueBinarySort(input, { returnOriginal: true, outputFormat: 'bits' }) // returnOriginal takes precedence
```

**Important Notes:**

- When `returnOriginal: true`, returns the actual input values reordered by their bit-sort order (bit counts are computed from original values before any transformation).
- When `returnOriginal: false`, returns either Base64 strings (default) or raw bit strings, depending on `outputFormat`.
- **Information Loss with Base64/Bits Output**: The sorted bit representation (Base64 or raw bits) only preserves the *count* of zeros and ones, not the original bit pattern. **Different values can produce identical Base64/bits output** if they have the same bit counts. For example, `1`, `2`, `256`, etc., all have 63 zeros and 1 one in their 64-bit representation, so they all produce the same output when using `returnOriginal: false`.
  - **Use `returnOriginal: true`** if you need to recover the original values
  - **Use Base64/bits output** only for analysis or research where bit-count ordering is the primary interest

Binary inputs (Buffer, ArrayBuffer, TypedArrays) are treated as binary primitives and will be represented as Base64 strings or bits. Numbers are converted by flooring to 64-bit unsigned integers before bit-counting. Circular references are detected and serialized as `"[Circular]"` during conversion.

---

## Understanding Base64/Bits Output Collisions

When using the default `returnOriginal: false` with `outputFormat: 'base64'` or `'bits'`, the output only encodes the **count of zeros and ones**, not the original bit pattern. This means multiple different values can produce **identical output**.

### Example: Collision

```javascript
const input = [0, 1, 2, 256];

// Bit counts (64-bit representation):
// 0   → 64 zeros, 0 ones  → sorted: "0000...0000"
// 1   → 63 zeros, 1 one   → sorted: "0000...0001"
// 2   → 63 zeros, 1 one   → sorted: "0000...0001"  ← SAME as 1!
// 256 → 63 zeros, 1 one   → sorted: "0000...0001"  ← SAME as 1 and 2!

const output = TrueBinarySort(input, { outputFormat: 'bits' });
// Result: ["0000...0000", "0000...0001", "0000...0001", "0000...0001"]
// You've lost the information about which value is which!

// Solution: Use returnOriginal: true to preserve original values
const sortedWithOriginals = TrueBinarySort(input, { returnOriginal: true });
// Result: [0, 1, 2, 256]
// Original values maintained in bit-sorted order
```

### When to Use Each Option

| Use Case | Option | Benefit |
|----------|--------|---------|
| **Research/Analysis**: Study bit-count distribution | `outputFormat: 'bits'` or `'base64'` | Raw bit data, compact representation |
| **Preserve Original Values**: Sort objects/arrays but keep originals | `returnOriginal: true` | No information loss, original values recovered |
| **Interop/Transmission**: Compact representation for research purposes | `outputFormat: 'base64'` | Compact, Base64-encoded, suitable for storage/transmission |
| **Binary Analysis**: Raw bit strings for detailed bit study | `outputFormat: 'bits'` | Human-readable 0s and 1s |

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

// Get Base64 strings (sorted by underlying bit counts)
const base64Strings = TrueBinarySort(input);
// Result: ["...base64...", "...base64...", "...base64..."]
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

1. **Convert** - Each input is converted to a Uint8Array (numbers as 64-bit, strings as UTF-8, etc.)
2. **Count Bits** - Count the number of zeros and ones in the binary representation
3. **Reorder** - Create a sorted bit string by placing all zeros first, then all ones
4. **Format Output** - Encode as Base64 (default), raw bits, or return original values reordered
5. **Sort Collections** - Collections are sorted by:
   - Primary: count of `1` bits (ascending)
   - Secondary: bit string comparison (lexicographic)
   - Tertiary: original order (stable sort)
6. **Return** - Either Base64/bits strings (lossy, bit-count only) or original values in sorted order (lossless)

### Important: Information Loss

The Base64 or bits output formats only encode the **count** of zeros and ones, not the original bit pattern. Different values with the same bit counts will produce identical output. Use `returnOriginal: true` if you need to recover the original values.

## License

MIT
