```markdown
# LECTURE 2

## First Class Functions

var x = function square(a){return a*a}

x; // gives you the definition of x

x(100) // o/p = 10000

var mySum = function(a,b){return a+b}
mySum(100,50)
mySum(100,50,200) // o/p = 150 (200 will not be counted)

If we want the 200, then we redefine the function:

mySum = function(a,b,c){return a+b+c}

### 3 Types of Functions We Care About

1. Function Declaration

var mySum = function(a,b){return a+b}

- The keyword here is `function` at the beginning.  
- Values can be passed in the function or outside, doesn’t matter.  
- Available anywhere inside the file.

2. Function Expression

const mySum = function sum(a,b){
    return a + b;
};
mySum(5,6);

- The declaration of `sum` could be used in cases of recursive functions.  
- A second name is a good habit to have.  
- `mySum(3,3)` would only work after the function is defined, not before.  

Example of function expression:

(function(a,b){return a+b})

- Does not need to be assigned to variables, can be assigned to properties.

3. Arrow Functions

const mySum = (a,b) => a+b;

const sq = x => x*x;   // single parameter, return x*x
const zero = () => 0;  // no parameters, return 0

[1,2,3].map(sq)    // [1,4,9]
[1,2,3].map(zero)  // [0,0,0]

### Multiline Arrow Functions

const sumOfSquares = (a,b) => {
    let aa = sq(a)
    let bb = sq(b)
    return mySum(aa,bb)
}

- Yes, you can have if-statements inside.  
- Benefit lost: arrow functions don’t have their own `this`.  

---

### Examples

Employee Record

function employeeID(IMPID){
    return { employee_id: IMPID };
}

// Now with arrow:
const create_employee = IMPID => ({ employee_ID: IMPID });

Rule of thumb:  
- ({ ... }) → returns an object literal.  
- { ... } → treated as a block of code.

---

### Arrow Functions & `this`

const myFrac = {
    num: 3, den: 4,
    toDecimal: function(){ return this.num/this.den }
}

const myFrac2 = {
    num: 3, den: 4,
    toDecimal: () => this.num/this.den  // this will not work properly
}

Arrow functions do not bind their own `this`, they use `this` from the outer scope.

---

### Destructuring Assignment

let download = {a:5, b:7, c:5, d:"str", e:10}
let {a,c,e} = download
// Extracts properties a, c, e into variables

---

### Spread and Rest Operators

Spread – converts from array to parameter list:

Math.max(5,4)

const download = [5,0,100,40505,405,320]
Math.max(...download) // spreads array into arguments

Another example:

let a = [1,2,3]
let b = [7,8,9]
let c = [...a,4,5,6,...b]
// c = [1,2,3,4,5,6,7,8,9]

For objects:

let download = {a:5,b:7,c:5,d:"str",e:10}
let f = "perf"

{...download, f}       // shorthand: adds property f:"perf"
{...download, f:f}     // explicitly says key f with value f

Rest – converts from parameter list to array:

function myMax(...nums){
    return Math.max(...nums)
}

- Rest is only used in function definitions.  
- Spread is used in function calls or object/array literals.  

---

## Topic 2: Stacks and Heaps

### Stacks

| Identifier | Address   | Value |
|------------|-----------|-------|
| R1C1       | R1C2      | R1C3 |
| R2C1       | R2C2      | R2C3 |
| ...        | ...       | ...  |
| R10C1      | R10C2     | R10C3 |

- Objects go in heap.  
- When you write x = obj, the reference x goes in stack, actual object goes in heap.

let n1 = 31

#### Case 5: Shallow Copy Example

let f1 = {num:3, den:4, inverse:{num:4, den:3}};
let f2 = {...f1};
f1.num = 1;
f1.den = 2;let f1 = {num:3, den:4, inverse:{num:4, den:3}};
let f2 = {...f1};
f1.num = 1;
f1.den = 2;
f1.inverse.num = 2;
f1.inverse.den = 1;

console.log(f2);            // What does this print out? (tricky)
f1.inverse.num = 2;
f1.inverse.den = 1;

console.log(f2);

| Step | Code Run | f1 | f2 |
|------|----------|----|----|
| 1 | let f1 = {num:3, den:4, inverse:{num:4, den:3}}; | { num:3, den:4, inverse:{ num:4, den:3 } } | — |
| 2 | let f2 = {...f1}; | { num:3, den:4, inverse:{ num:4, den:3 } } | { num:3, den:4, inverse:{ num:4, den:3 } } |
| 3 | f1.num = 1; | { num:1, den:4, inverse:{ num:4, den:3 } } | { num:3, den:4, inverse:{ num:4, den:3 } } |
| 4 | f1.den = 2; | { num:1, den:2, inverse:{ num:4, den:3 } } | { num:3, den:4, inverse:{ num:4, den:3 } } |
| 5 | f1.inverse.num = 2; | { num:1, den:2, inverse:{ num:2, den:3 } } | { num:3, den:4, inverse:{ num:2, den:3 } } |
| 6 | f1.inverse.den = 1; | { num:1, den:2, inverse:{ num:2, den:1 } } | { num:3, den:4, inverse:{ num:2, den:1 } } |

---

## Scopes

### Global Scope

function myScope() {
  x = 5;
}
myScope();
console.log(x); // leaks into global scope

### Function Scope (var)

function myScope(a) {
  var x = 5;
}
myScope(3);
console.log(x); // error, x is not defined

Inside conditions:

function myScope(a) {
    if(a < 10){
        var x = 10;
        return x;
    }
}
console.log(myScope(11)); // undefined

### Lexical Scope (let/const)

- With let, you can modify values.  
- With const, you cannot reassign.  
- Accessible only inside the most recent block in which they are defined.
```
