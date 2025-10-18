# Lecture 1 - JavaScript Syntax

## Why does `0.1 + 0.2` equal `0.30000000000000004`?
JavaScript (like many programming languages) uses **floating-point arithmetic** (IEEE 754 standard).  
Some decimal fractions cannot be represented exactly in binary, which causes small rounding errors.  

Example:
```js
0.1 + 0.2
// Output: 0.30000000000000004
```



---

## Evaluation Order
JavaScript expressions are generally evaluated **left to right** (depending on operator precedence).

---

## Backtick Symbols
Backticks `` ` ``, also known as **template literals**, are used for:
- **String interpolation**: embedding variables directly inside strings.
- **Multi-line strings**.

Example:
```js
let name = "Devak";
console.log(`Hello, ${name}!`); 
// Output: Hello, Devak!
```

---

## Example: `null` vs `undefined` vs `"null"`
```js
let donna = { emp_id: 15, supervisor: "Eric" };
let eric = { emp_id: 12, supervisor: "Mary" };

// `undefined`: value not yet assigned
let derrek = { emp_id: 60, supervisor: undefined };

// `null`: intentional absence of value (e.g., CEO has no supervisor)
let mary = { emp_id: 1, supervisor: null };

// `"null"`: just a string, valid but different from null
let joe = { emp_id: 30, supervisor: "null" };
```

### Explanation
- `undefined`: placeholder when a property hasn’t been assigned a value.  
- `null`: intentional empty value (makes sense when something should exist but doesn’t).  
- `"null"`: just text, treated as a string.  

---
