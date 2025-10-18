
# CS355 — Asynchronous Programming (Node.js, Callbacks-Only) — **Master Guide**

> ✅ **Exam-Ready, Callbacks-Only.**  
> This guide explains the Node.js asynchronous model (without Promises/`async`/`await`) and provides **step‑by‑step solutions** to **six assessment exercises** using only the **allowed core APIs**.  
> Includes **reasoning**, **pitfalls**, and **variations** to help you *master* the topic.

---


## 🧠 Mental Model First: Event Loop, Tasks, and Callbacks

- **Single-threaded JS, multi-threaded runtime**: JavaScript runs on **one thread**, while the runtime (Node.js + **libuv**) handles OS-level async I/O on background threads.  
- **Non-blocking I/O**: You start an operation (e.g., `fs.readFile`), give a **callback**, JS continues running; when I/O finishes, Node schedules your callback on the **event loop**.
- **Error‑first callbacks**: Node conventions pass `(err, data)` to the callback. Always check `if (err) ...` first.
- **Concurrency vs. order**: If you start many async tasks in a loop, they **finish in unpredictable order**. To enforce order, **chain** the next task **inside the previous callback** (or use recursion).

> 💡 **Key exam skill**: Decide **when** you want concurrency (faster, non-deterministic order) vs. **sequential** execution (deterministic order). Master both patterns with callbacks.

---

## 📚 Callback Patterns You’ll Use

### 1) **Fire-and-count** (concurrent, detect when *all* finished)
- Start N async ops, **increment a counter** in each callback; when `completed === N`, you’re done.

### 2) **Recursive chaining** (sequential order)
- Start first async op; in its callback, start the next; continue until done.

### 3) **Index-preserving accumulation**
- When order matters but tasks run concurrently, store results in an **array by index**; when all done, **join** in original order.

---

## 🧪 Exercise 1 — **Writing N Files Asynchronously**

**Allowed**: `fs.writeFile()`  
**Input**: integer `n` (`0 < n < 100`)  
**Output**: files `01-output.txt` .. `n-output.txt` in `./output/`, each containing `"Data-1"`  
**Behavior**: Filenames **printed in completion order** (almost never sorted). After all finish, print `"Writing Complete"`.

> ⚠️ **Common mistake**: Printing inside the loop *outside* the `writeFile` callback. That prints **before** any write has finished.

```js
// 01-async-write.js
const fs = require("fs");
const path = require("path");

const n = Number(process.argv[2] || 10);
if (!(n > 0 && n < 100)) {
  console.error("Usage: node 01-async-write.js <n>, where 0 < n < 100");
  process.exit(1);
}

const outDir = path.join(__dirname, "output");
try { fs.mkdirSync(outDir, { recursive: true }); } catch {}

let completed = 0;

for (let i = 1; i <= n; i++) {
  const name = String(i).padStart(2, "0") + "-output.txt";
  const filePath = path.join(outDir, name);
  fs.writeFile(filePath, "Data-1", (err) => {
    if (err) { console.error("Write failed:", name, err); return; }
    console.log(name);                // ✅ print AFTER success
    completed++;
    if (completed === n) {
      console.log("Writing Complete");
    }
  });
}
```

> ✅ **Why this works**: Every `writeFile` runs concurrently; prints appear when each finishes; the **counter** detects global completion.


---

## 🧪 Exercise 2 — **Writing N Files Synchronously (using async API)**

**Allowed**: `fs.writeFile()` (**do not** use `fs.writeFileSync`)  
**Goal**: Ensure filenames are printed **in order** by **chaining** writes via callbacks.

```js
// 02-seq-write-using-async.js
const fs = require("fs");
const path = require("path");

const n = Number(process.argv[2] || 10);
if (!(n > 0 && n < 100)) {
  console.error("Usage: node 02-seq-write-using-async.js <n>, where 0 < n < 100");
  process.exit(1);
}

const outDir = path.join(__dirname, "output");
try { fs.mkdirSync(outDir, { recursive: true }); } catch {}

function writeSequential(i) {
  if (i > n) { console.log("Writing Complete"); return; }

  const name = String(i).padStart(2, "0") + "-output.txt";
  const filePath = path.join(outDir, name);

  fs.writeFile(filePath, "Data-2", (err) => {
    if (err) { console.error("Write failed:", name, err); return; }
    console.log(name);                  // prints in-order
    writeSequential(i + 1);            // chain next write
  });
}

writeSequential(1);
```

> 🧩 **Pattern**: This is **recursive chaining** → deterministic order without blocking the event loop.


---

## 🧪 Exercise 3 — **Personal Hosts File**

**Allowed**: `fs.readFile()`, `fs.writeFile()`, `dns.resolve()`  
**Disallowed**: `fs.appendFile()`  
**Input**: `./input/domains.txt` — one valid domain per line (each resolves to **one** IP)  
**Output**: `./output/hosts.txt` — lines of: `ip_address\t domain`  
**Order**: doesn’t matter (bonus below preserves order)

### (A) Concurrent, order doesn’t matter
```js
// 03-hosts-unordered.js
const fs = require("fs");
const path = require("path");
const dns = require("dns");

const inFile = path.join(__dirname, "input", "domains.txt");
const outFile = path.join(__dirname, "output", "hosts.txt");
try { fs.mkdirSync(path.dirname(outFile), { recursive: true }); } catch {}

fs.readFile(inFile, "utf8", (err, text) => {
  if (err) return console.error("Read failed:", err);

  const lines = text.split(/\r?\n/).filter(Boolean);
  let completed = 0;
  const rows = [];

  lines.forEach((domain) => {
    dns.resolve(domain, (err, addrs) => {
      if (err) { console.error("Resolve failed:", domain, err); }
      else {
        rows.push(`${addrs[0]}\t${domain}`);
      }
      completed++;
      if (completed === lines.length) {
        fs.writeFile(outFile, rows.join("\n") + "\n", (err) => {
          if (err) console.error("Write failed:", err);
          else console.log("hosts.txt written");
        });
      }
    });
  });
});
```

### (B) **Bonus**: Preserve input order while resolving concurrently
```js
// 03-hosts-ordered.js
const fs = require("fs");
const path = require("path");
const dns = require("dns");

const inFile = path.join(__dirname, "input", "domains.txt");
const outFile = path.join(__dirname, "output", "hosts.txt");
try { fs.mkdirSync(path.dirname(outFile), { recursive: true }); } catch {}

fs.readFile(inFile, "utf8", (err, text) => {
  if (err) return console.error("Read failed:", err);

  const domains = text.split(/\r?\n/).filter(Boolean);
  const results = new Array(domains.length);
  let completed = 0;

  domains.forEach((domain, i) => {
    dns.resolve(domain, (err, addrs) => {
      results[i] = err ? `ERROR\t${domain}` : `${addrs[0]}\t${domain}`;
      if (++completed === domains.length) {
        fs.writeFile(outFile, results.join("\n") + "\n", (err) => {
          if (err) console.error("Write failed:", err);
          else console.log("hosts.txt written (ordered)");
        });
      }
    });
  });
});
```

> 💡 **Technique**: Store each result at its **original index**. When all done, join in order.


---

## 🧪 Exercise 4 — **Four Synchronous Tasks**

**Allowed**: `fs.readFile()`, `zlib.inflate()`, `dns.resolve()`, `fs.writeFile()`  
**Input**: `domain.deflated` (binary)  
**Output**: `ip_address.txt` (just the IP, no brackets)

**Pipeline**: `readFile (binary)` → `inflate` → `toString("utf8")` → `dns.resolve` → `writeFile`

```js
// 04-four-sync-tasks.js
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const dns = require("dns");

const inFile = path.join(__dirname, "domain.deflated");
const outFile = path.join(__dirname, "ip_address.txt");

fs.readFile(inFile, { encoding: null }, (err, buf) => {
  if (err) return console.error("Read failed:", err);

  zlib.inflate(buf, (err, inflated) => {
    if (err) return console.error("Inflate failed:", err);

    const domain = inflated.toString("utf8").trim();
    dns.resolve(domain, (err, addrs) => {
      if (err) return console.error("Resolve failed:", domain, err);

      const ip = addrs[0];
      fs.writeFile(outFile, ip, (err) => {
        if (err) console.error("Write failed:", err);
        else console.log("ip_address.txt written:", ip);
      });
    });
  });
});
```

> 🔗 **Chaining** ensures strict order: we don’t resolve until inflate finishes, and we don’t write until resolve returns.


---

## 🧪 Exercise 5 — **batch-b**

**Allowed**: `fs.readFile()`, `fs.writeFile()`  
*(Template may also use `fs.readdirSync()` to list filenames — we’ll use it to discover inputs.)*

**Input**: `n` text files: `01-input.txt`..`n-input.txt` in `./input/`  
**Param**: `b` batch size (`0 < b < n`)  
**Output**: `m = ceil(n/b)` files in `./output/`: `01-output.txt`..`m-output.txt`  
**Rule**: For every `b` inputs **in filename order**, concatenate their contents (UTF‑8) into the next output.

### Implementation (preserve input order)
```js
// 05-batch-b.js
const fs = require("fs");
const path = require("path");

const inDir = path.join(__dirname, "input");
const outDir = path.join(__dirname, "output");
try { fs.mkdirSync(outDir, { recursive: true }); } catch {}

const n = Number(process.argv[2] || 11); // e.g., 11
const b = Number(process.argv[3] || 5);  // e.g., 5
if (!(n > 0 && b > 0 && b < n && n < 100)) {
  console.error("Usage: node 05-batch-b.js <n> <b>, with 0<b<n<100");
  process.exit(1);
}

// Discover and sort inputs (01-input.txt..n-input.txt), then take first n
let inputs = fs.readdirSync(inDir)
  .filter(name => /^\d{2}-input\.txt$/.test(name))
  .sort()
  .slice(0, n)
  .map(name => path.join(inDir, name));

const contents = new Array(inputs.length);
let completed = 0;

// Read all concurrently but store by index for order
inputs.forEach((file, i) => {
  fs.readFile(file, "utf8", (err, text) => {
    contents[i] = err ? "" : text;
    if (++completed === inputs.length) flushBatches();
  });
});

function flushBatches() {
  const m = Math.ceil(inputs.length / b);
  let pending = m;

  for (let k = 0; k < m; k++) {
    const start = k * b;
    const end = Math.min(start + b, contents.length);
    const chunk = contents.slice(start, end).join("");

    const name = String(k + 1).padStart(2, "0") + "-output.txt";
    fs.writeFile(path.join(outDir, name), chunk, "utf8", (err) => {
      if (err) console.error("Write failed:", name, err);
      if (--pending === 0) console.log(`Wrote ${m} batched files.`);
    });
  }
}
```

> 🧩 **Idea**: Read concurrently for speed, but **preserve order** by storing text at the correct index before batching.


---

## 🧪 Exercise 6 — **Decode the Secret Message**

**Allowed**: `fs.readFile()`, `fs.writeFile()`, `zlib.inflate()`, `Buffer.concat()`  
*(Template may also use `fs.readdirSync()` to list filenames)*

**Input**: `n` binary files in `./input/`, named `01`, `02`, … (up to `99`). Each is a **DEFLATE**-compressed fragment.  
**Output**: `./output/secret-message.zip` — concatenate **inflated** buffers **in filename order**.

### Implementation
```js
// 06-decode-secret-message.js
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const inDir = path.join(__dirname, "input");
const outDir = path.join(__dirname, "output");
const outFile = path.join(outDir, "secret-message.zip");
try { fs.mkdirSync(outDir, { recursive: true }); } catch {}

// Discover input fragments in order
const parts = fs.readdirSync(inDir)
  .filter(name => /^\d{2}$/.test(name)) // "01", "02", ...
  .sort()
  .map(name => path.join(inDir, name));

if (parts.length === 0) {
  console.error("No input parts found. Expect files named 01, 02, ... in ./input");
  process.exit(1);
}

const inflated = new Array(parts.length);
let completed = 0;

parts.forEach((file, i) => {
  fs.readFile(file, { encoding: null }, (err, data) => {
    if (err) return done(i, null, err);
    zlib.inflate(data, (err, buf) => done(i, buf, err));
  });
});

function done(i, buf, err) {
  if (err) { console.error("Failed at", parts[i], err); inflated[i] = Buffer.alloc(0); }
  else { inflated[i] = buf; }

  if (++completed === parts.length) {
    const out = Buffer.concat(inflated);
    fs.writeFile(outFile, out, (err) => {
      if (err) console.error("Write failed:", err);
      else console.log("Wrote:", outFile, "(size:", out.length, "bytes )");
    });
  }
}
```

> 🔒 **Binary discipline**: Use `{ encoding: null }` when reading compressed data; only convert to string when you *know* the data is text.


---

## 🔬 Deep Understanding & Pitfalls (Exam Gold)

### 1) **Why “print-after-write” must be in the callback**
Because `fs.writeFile` **returns immediately**; the operation finishes later. Printing outside the callback prints **before** the write is done.

### 2) **Why order is unpredictable in concurrent loops**
Loop starts N writes **instantly**. OS and disk scheduling determine completion order. **Never assume loop index = finish order.**

### 3) **How to force order with async APIs**
**Chain callbacks** (sequential recursion). This is the only way without Promises/`await`.

### 4) **Closures prevent losing your loop variable**
When using a loop, wrap work in a function so the **current index/domain** is captured by closure (as in `resolve(domain) { ... }`).

### 5) **DNS/Network I/O may fail**
Always handle `err`. One bad domain shouldn’t crash the pipeline—either skip or write an error line.

### 6) **Binary vs Text encodings**
- Text: `"utf8"`
- Binary: `{ encoding: null }`
- Never `toString()` binary unless you intend to view bytes as text.

### 7) **Livelock in naïve CSMA-like waiting**
If multiple tasks retry on the **same schedule**, they can collide forever. Randomized backoff prevents synchronization (CSMA/CA idea).

---

## 🧩 Extra Practice: Tracing Execution

```js
const fs = require("fs");
console.log("A");
fs.readFile("input/file01.txt", "utf8", function after_read(err, data){
  console.log("C");
});
console.log("B");
```
**Output order**: `A`, `B`, `C`  
Reason: `readFile` is async → schedules `after_read` → JS continues to print `B` → later callback prints `C`.

```js
// let vs var in loops (timers as a proxy for async)
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i), 0); // 0 1 2
for (var j = 0; j < 3; j++) setTimeout(() => console.log(j), 0); // 3 3 3
```
`let` creates a new binding per iteration; `var` shares one binding that ends at 3.

---

## ✅ What to Memorize for Exam Speed

- Three patterns: **fire‑and‑count**, **recursive chaining**, **index‑preserving accumulation**.  
- Where to place **prints** (inside callbacks).  
- Proper encodings: `"utf8"` for text, `{encoding: null}` for binary.  
- `dns.resolve(domain, cb)` → `cb(err, addressesArray)` (use `addresses[0]`).  
- Creating ordered output from unordered async completion.

---

## 🧰 Quick Scripts Index

- `01-async-write.js` — concurrent writes, counter.  
- `02-seq-write-using-async.js` — chained writes, ordered.  
- `03-hosts-unordered.js` — domains → IPs (unordered).  
- `03-hosts-ordered.js` — domains → IPs (ordered).  
- `04-four-sync-tasks.js` — read → inflate → resolve → write (chained).  
- `05-batch-b.js` — read N inputs concurrently → batch by B (ordered).  
- `06-decode-secret-message.js` — inflate parts → concat → zip file.

> 📝 Create `input/` and `output/` directories as needed.  
> Run scripts via `node script.js <args>`.

---

**You’ve got this.** Practice typing each solution from memory until you can write them in **5–7 minutes** with correct callbacks and error handling.
