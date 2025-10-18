# 🧠 CS355 — Exam Review Master Notes (Async + Systems)  

> ✅ **Complete exam-prep file** combining asynchronous programming, V8/libuv internals, memory tracing, network layers, and callback coding.  
> All answers are designed in *exam-solution* style — clear, short, and reasoned.  

---

## 1️⃣ V8 and libuv

### 🔹 What is V8?
- **V8** is Google’s JavaScript engine (written in C++) used in **Node.js** and **Chrome**.  
- It **compiles JS into machine code**, not interpreting line-by-line.  
- Uses **JIT (Just-In-Time) compilation**: translates frequently executed code paths into optimized machine instructions at runtime.  
- Manages **garbage collection (GC)** and **memory allocation** automatically.

### 🔹 What is libuv?
- **libuv** is the **C library** Node.js uses to provide **asynchronous, non-blocking I/O**.  
- It runs the **event loop**, manages **thread pools**, **timers**, and **system I/O**.  
- JS itself can’t handle async directly; **libuv** delegates operations like file read, DNS lookup, and network requests to OS threads, and when done, sends results back to **V8’s event loop**.

### 🔹 How They Work Together
| Component | Role | Example |
|:-----------|:-----|:--------|
| **V8** | Executes JS code (callbacks, functions) | Executes `console.log()` |
| **libuv** | Manages async operations (I/O, timers) | Runs `fs.readFile()` in background |

### 🔹 Comparison with Standard Compilers (like C/C++)
| Aspect | V8 (JS) | C/C++ Compiler |
|:--------|:----------|:----------------|
| Compilation | JIT during runtime | Ahead-of-time (AOT) before execution |
| Memory Management | Automatic GC | Manual via malloc/free |
| Concurrency | Event loop, async callbacks | Multithreading (pthreads) |
| Execution Flow | Non-blocking I/O (libuv) | Blocking by default |

> 💡 **Summary:** Node.js uses **V8** for JS execution and **libuv** for async I/O → Together they simulate concurrency on a single thread.

---

## 2️⃣ Memory Tracing

### 🔹 What It Means
Memory tracing is tracking how memory is **allocated**, **referenced**, and **released** during program execution.

### 🔹 In V8 / Node.js
- V8 allocates **heap space** for objects and functions.  
- Garbage collection automatically removes objects **no longer referenced**.  
- Tools like `--trace_gc` or Chrome DevTools visualize memory usage.

### 🔹 Common Terms
| Term | Meaning |
|:------|:--------|
| **Stack** | Holds local variables, function calls (LIFO) |
| **Heap** | Dynamic memory (objects, closures) |
| **Closure** | Function that “remembers” outer variables — increases lifetime |
| **Reference** | Pointer from one variable to another; if all removed → GC reclaims |

### 🔹 Why It Matters
- Memory tracing helps identify **leaks** (when objects are unintentionally kept alive).  
- Understanding stack/heap helps explain **closures and async behavior**.

> 💡 When a callback references variables from outer scopes, those objects remain in memory until the callback runs — *closure keeps them alive.*

---

## 3️⃣ Asynchronous Execution Order (Which Prints First?)

### 🔹 Basic Example
```js
const fs = require("fs");
console.log("A");
fs.readFile("file.txt", "utf8", (err, data) => {
  console.log("C");
});
console.log("B");
```
**Output:**
```
A
B
C
```
### 🔹 Why?
1. JS executes **synchronously** top-to-bottom (V8).  
2. When `fs.readFile()` is called, **libuv** handles it in the background.  
3. JS moves on → prints `"B"`.  
4. Once reading completes, libuv pushes callback into **event queue**, executed later → `"C"`.

### 🔹 Rule of Thumb
| Category | Runs In |
|:----------|:--------|
| **Normal JS (console.log, loops)** | Call stack (synchronous) |
| **Callbacks / async ops (I/O, timers, DNS)** | Event loop / task queue |
| **Microtasks (Promises)** | After current call stack, before next I/O |

### 🔹 Analogy
Think of the event loop as a **waiter** taking orders (tasks) — JS cooks one dish at a time (single thread), libuv handles the oven (I/O) and notifies when ready.

> 💡 **Exam tip:** Always explain *what runs synchronously first (V8)* and *what’s deferred to libuv’s task queue.*

---

## 4️⃣ Network Hub (Physical Layer Device)

### 🔹 What It Does
- A **hub** connects multiple devices in a local network (Layer 1).  
- It **duplicates** incoming electrical signals on **all ports** — no intelligence, no filtering.  
- Creates **one large collision domain** (only one device can talk at a time).

### 🔹 Example
```
[PC1] ↔ HUB ↔ [PC2] ↔ HUB ↔ [PC3]
```
If PC1 sends, everyone “hears” it — collisions possible.

### 🔹 Why It’s Obsolete
- Replaced by **switches**, which forward data based on MAC addresses (Layer 2).  
- Hubs cause bandwidth waste and high collisions.

> 💡 *Hubs operate purely electrically — they don't understand data frames.*

---

## 5️⃣ Switch Algorithm Trace (Data Link Layer Device)

### 🔹 What a Switch Does
- Operates at **Layer 2 (Data Link)**.  
- Uses a **MAC Address Table** to forward frames intelligently.  
- Each port = separate **collision domain** → prevents data corruption.

### 🔹 Algorithm Flow
1. **Learning Phase**: When a frame arrives, the switch records `source MAC → incoming port`.  
2. **Forwarding Phase**: Checks `destination MAC` in its table.  
   - If **found**, forwards to that port.  
   - If **unknown**, broadcasts to all ports (like a hub).  
3. **Aging Phase**: Entries expire after timeout if inactive.

### 🔹 Trace Example
| Step | Incoming Frame | Source MAC | Destination MAC | Action |
|:------|:----------------|:-------------|:-----------------|:--------|
| 1 | Port 1 | A | B | Learn A:1 → Broadcast |
| 2 | Port 2 | B | A | Learn B:2 → Send only to Port 1 |
| 3 | Port 3 | C | A | Learn C:3 → Send to Port 1 |

> ✅ *Switch learns dynamically and isolates collisions — main reason it replaced hubs.*

---

## 6️⃣ FCS — Frame Check Sequence

### 🔹 Definition
**FCS (Frame Check Sequence)** is a 32‑bit field at the end of an Ethernet frame used for **error detection**.

### 🔹 Purpose
- Detects **corruption** during transmission (due to noise, interference).  
- Computed using a **CRC (Cyclic Redundancy Check)** algorithm (e.g., CRC32).  

### 🔹 What It Does
| Function | Description |
|:-----------|:------------|
| ✅ **Detects errors** | Receiver recomputes FCS; mismatch → frame discarded |
| ✅ **Guarantees data integrity** | Ensures bits were not flipped in transit |
| ❌ **Does not correct errors** | Only *detects* them; sender must resend (handled by higher layers) |

### 🔹 Example (Avalanche Effect)
A single-bit change causes a **completely different hash**:  
```
"Hello" → 0x2FA4
"Hallo" → 0x9B3C
```

> 💡 *FCS ensures “was this message corrupted?” not “what was the correct data?”*

---

## 7️⃣ Coding Asynchronous (Callbacks, Closures, Stack Frames)

### 🔹 How Callbacks Really Work
1. **V8 executes JS** top-to-bottom.  
2. **libuv** offloads async ops (e.g., DNS, file I/O).  
3. Once done, it pushes the callback back to the **event loop queue**.  
4. When the call stack is empty, the **event loop** executes the callback.

### 🔹 Example: DNS Resolution
```js
const dns = require("dns");
const domain = "venus.cs.qc.cuny.edu";

dns.resolve(domain, after_resolution);
console.log("Main thread continues...");

function after_resolution(err, records) {
  if (err) console.error("Failed:", domain);
  else console.log(domain, records);
}
```
**Output order:**
```
Main thread continues...
venus.cs.qc.cuny.edu [ '149.4.199.190' ]
```

### 🔹 Why?
- The first `console.log` runs immediately in **V8’s stack**.  
- The `dns.resolve` callback executes later when libuv signals completion.

### 🔹 Closures & Stack Frames
When a callback is defined **inside another function**, it remembers outer variables via **closure** — even after the parent function exits.

```js
function makeReader(filename) {
  return function read() {
    fs.readFile(filename, "utf8", (err, data) => {
      console.log("File:", filename, "size:", data.length);
    });
  };
}

const readA = makeReader("fileA.txt");
readA(); // still knows which file to read
```

### 🔹 Key Concepts to Master
| Concept | Description |
|:----------|:-------------|
| **Closure** | Function retains variables from outer scope |
| **Event Loop** | Decides when callbacks run |
| **Stack Frame** | Each function call has its own memory (local vars, return address) |
| **Return Pointers** | Keep track of where to resume after a callback finishes |

> 💡 *Async code is just normal JS + deferred callbacks managed by libuv’s event loop.*

---

## 🔁 Combined Big Picture

| Layer | Concept | Example | Notes |
|:------|:--------|:---------|:-------|
| JS Engine | V8 | Executes code & manages memory | Has GC, closures |
| C Library | libuv | Handles I/O asynchronously | Thread pool & event loop |
| Hardware | Hub/Switch | Physical & Data link layers | Deliver frames |
| Data Integrity | FCS | Detects corruption | No correction |
| Application | Async Code | Uses callbacks | Must handle race conditions |

---

## 🧩 Quick-Answer Flashcards (for Oral/Written Exams)

| Question | Key 3-Line Answer |
|:----------|:------------------|
| **What’s the difference between V8 and libuv?** | V8 executes JS; libuv manages async I/O. Together, they enable non-blocking operations on a single thread. |
| **How does Node achieve async on one thread?** | libuv runs I/O in background threads; event loop runs callbacks when done. |
| **How does a switch differ from a hub?** | Hub broadcasts blindly; switch forwards intelligently by MAC. |
| **What does FCS do?** | Detects corrupted frames via CRC32. Doesn’t fix errors. |
| **Why does “B” print before “C” in async code?** | “B” is synchronous (V8). “C” is callback (libuv → event loop). |
| **What’s a closure?** | Function that retains access to variables from its creation scope. |
| **How do you preserve order in async file writes?** | Chain callbacks recursively or use counters with index arrays. |

---

**✅ You now have every key topic mentioned in class, Discord, and the assessment combined in one file.**  
Practice explaining each answer in **under 20 seconds** to ace short-response questions.
