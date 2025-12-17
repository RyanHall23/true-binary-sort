# TrueBinarySort

> Sorts the bits of anything. Truly. Pointlessly.

**TrueBinarySort** converts any input into binary, sorts all bits so that `0`s come first, and returns the result as a string. Collections (arrays, objects, Maps) are reordered based on their bit data.  

It is:
- Deterministic
- Universal (numbers, strings, buffers, objects, arrays, booleans, functions, etc.)
- Stable (preserves order for elements with identical bit values)
- Totally pointless

## Installation

## Usage
```javascript
import TrueBinarySort from 'true-binary-sort';

const input = [0, 1, 2, 5];
const output = TrueBinarySort(input);
console.log(output);
// Example output: ["0000000000000000000000000000000000000000000000000000000000000000", "0000000000000000000000000000000000000000000000000000000000000001", "0000000000000000000000000000000000000000000000000000000000000011", "0000000000000000000000000000000000000000000000000000000000000111"]
```

```bash
npm install true-binary-sort
