# Asynchronous Programming (Node.js) — Refactor + Answers

This document reformats your notes and code **and answers every question you asked inline**. It’s structured so you can paste it into a repo or class submission.

---

## 0) What counts as a “large program”?

**Q:** *what’s a large program, what makes a program large—i/o maybe hard drive?*  
**A:** “Large” is about **workload and complexity**, not just file size. Typical growth drivers:
- **I/O volume & latency:** reading/writing many files, slow disks/SSDs, lots of network calls, DNS lookups, DB queries.
- **CPU time:** heavy parsing, compression, crypto, image/video processing.
- **Concurrency:** many things happening at once (many users, many requests).
- **Memory/State:** large datasets, caches, many in-flight operations.
- **Integration points:** calling other services/APIs.

**Q:** *to be 100% efficient we shouldn’t block the CPU to do these operations?*  
**A:** Right. In Node.js, you keep the **main thread** free by using **asynchronous APIs** so the event loop can continue handling other work while I/O is in progress.

---

## 1) Event Loop, libuv, and Callbacks — Who does what?

- **Event loop (main thread):** runs your JS, schedules async operations, and later **invokes callbacks** when results are ready.
- **libuv:** a C library Node uses for cross‑platform async I/O. It uses:
  - **OS facilities** (e.g., epoll/kqueue/IOCP) when possible.
  - A **thread pool** for operations that can’t be purely non‑blocking (e.g., some DNS, file system operations, crypto, compression).
- **Your callback:** always runs **on the main thread**, scheduled by the event loop **after** the current JS turn finishes.

> Think of it like this: JS tells libuv “start this I/O”, libuv/OS do the slow work in the background, and when done, the event loop queues your callback to run later.

---

## 2) `fs.readFile` Example + Answers

```js
// file: examples/fs-readfile.js
const fs = require("fs");

fs.readFile("input/file01.txt", "utf8", function after_read(err, data) {
  if (err) {
    console.log("Error Reading File");
  } else {
    console.log("Finished Reading File:", data.length);
  }
});

console.log("hello");
```

**Q:** *line 2 delegates the read operation to the file, who performs the reading tho? and what prints out?*  
**A:** Node asks **libuv** to perform the file read. libuv uses an **OS thread (thread pool)** to do the blocking disk I/O. Output order is deterministic:
1. `hello`
2. later → `Finished Reading File: ...` (or error)

**Q:** *in a world where read finishes instantly, is it possible to print “finished reading” before “hello”?*  
**A:** No. **Even if the OS finishes instantly**, your callback **still** goes into the event loop’s **micro/macro task queues** and will run **after** the current JS turn completes. JS has **run‑to‑completion** semantics: it won’t interleave your callback into the middle of currently executing code.

**Q:** *what’s a callback? who performs the callback?*  
**A:** A **callback** is a function you pass to an async API. **The event loop** calls it later (on the main thread) with results: `(err, data)`.

**Q:** *does libuv perform the asynchronous function?*  
**A:** libuv **or the OS** performs the **I/O work**. The **callback invocation** is scheduled by the **event loop** (main thread).

**Q:** *no as long as there is 1 line of code that is not finished you cannot, explain priority*  
**A:** The main thread executes one JS job at a time (**run‑to‑completion**). It **finishes** the current script turn (e.g., down to the bottom, printing `"hello"`) **before** it processes the next queued callbacks/timers/promises.

**Chaining work with the data:**

```js
const fs = require("fs");

function other(newdata) {
  console.log("OTHER received length:", newdata.length);
}

fs.readFile("input/file01.txt", "utf8", function after_read(err, data) {
  if (err) {
    console.error(err);
  } else {
    console.log("Finished Reading File:", data.length);
    other(data); // safe: runs after data is ready
  }
});

console.log("hello");
```

---

## 3) Concurrency with DNS (`dns.resolve`) + Answers

### A) Two lookups

```js
// file: examples/dns-two.js
const dns = require("dns");
const venus = "venus.cs.qc.cuny.edu";
const mars  = "mars.cs.qc.cuny.edu";

dns.resolve(venus, after_venus);
console.log("Prints Immediately 01");

function after_venus(err, records) {
  if (err) {
    console.error("Failed to resolve", venus);
  } else {
    console.log(venus, records);
  }
}

dns.resolve(mars, after_mars);
console.log("Prints Immediately 02");

function after_mars(err, records) {
  if (err) {
    console.error("Failed to resolve", mars);
  } else {
    console.log(mars, records);
  }
}
```

**Q:** *how do we know it’s async?*  
**A:** Node’s DNS APIs accept a **callback** and **return immediately**; the results arrive later via the callback. (There’s no synchronous `dns.resolveSync` for this API.)

**Q:** *each gets placed in task queue…which finishes first?*  
**A:** **Unpredictable.** Both lookups run concurrently (via c‑ares/libuv). Whichever completes first will have its callback queued first.

### B) Many lookups with a wrapper (closure)

```js
// file: examples/dns-wrapper.js
const dns = require("dns");

function resolve(domain) {
  // Inner callback closes over `domain` so we know which one finished
  dns.resolve(domain, function after_resolution(err, records) {
    if (err) {
      console.error("Failed to resolve", domain);
    } else {
      console.log(domain, records);
    }
  });
}

["venus.cs.qc.cuny.edu", "mars.cs.qc.cuny.edu"].forEach(resolve);
```

**Q:** *why is the callback nested — dependency via closure?*  
**A:** Yes. The inner `after_resolution` **captures** the `domain` variable so it’s available when the callback runs later. (You could also use `bind`, or pass `domain` via a wrapper.)

**Q:** *are these domains resolved one at a time or concurrently?*  
**A:** **Concurrently**. The for‑loop (or `.forEach`) **schedules** them all immediately; each runs in parallel in the background.

**Q:** *why is this pattern helpful and when to use it?*  
**A:** It’s **scalable** and **DRY**. You factor repeated logic (logging errors, printing results) into a single `resolve` helper and reuse it for **N** domains. Use it whenever the **same async workflow** needs to run for many inputs.

---

## 4) Sequential vs Concurrent vs **Limited** Concurrency

### A) Full concurrency (fire all at once)

```js
// file: examples/dns-all-at-once.js
const dns = require("dns");
const domains = ["venus.cs.qc.cuny.edu","mars.cs.qc.cuny.edu","earth.cs.qc.cuny.edu","cs.qc.cuny.edu","qc.cuny.edu","definitely.not.a.domain","cuny.edu"];

for (let i = 0; i < domains.length; i++) {
  dns.resolve(domains[i], (err, records) => {
    if (err) console.error("Failed:", domains[i]);
    else console.log(domains[i], records);
  });
}
```

- **Pros:** fastest wall‑clock time.
- **Cons:** with **huge N** (say 10M) you’ll overwhelm the resolver/remote servers and your own process. Bad network citizenship.

### B) Strictly sequential

```js
// file: examples/dns-sequential.js
const dns = require("dns");
const domains = ["venus.cs.qc.cuny.edu","mars.cs.qc.cuny.edu","earth.cs.qc.cuny.edu","cs.qc.cuny.edu","qc.cuny.edu","definitely.not.a.domain","cuny.edu"];
const ip_addresses = [];
let i = 0;

function next() {
  if (i === domains.length) {
    console.log("DONE (sequential):");
    console.log(ip_addresses);
    return;
  }
  const d = domains[i];
  dns.resolve(d, (err, records) => {
    ip_addresses.push(err ? null : records);
    i++;
    next(); // recurse to the next domain (one-at-a-time)
  });
}
next();
```

- **Pros:** never over-schedules; **order is guaranteed**.
- **Cons:** slow if many domains.

### C) **Limited concurrency** (recommended balance)

```js
// file: examples/dns-limited.js
const dns = require("dns");
const domains = ["venus.cs.qc.cuny.edu","mars.cs.qc.cuny.edu","earth.cs.qc.cuny.edu","cs.qc.cuny.edu","qc.cuny.edu","definitely.not.a.domain","cuny.edu"];
const results = new Array(domains.length);
const MAX = 3;          // at most 3 lookups in-flight
let inFlight = 0;
let nextIndex = 0;

function pump() {
  while (inFlight < MAX && nextIndex < domains.length) {
    const idx = nextIndex++;
    const d = domains[idx];
    inFlight++;
    dns.resolve(d, (err, records) => {
      results[idx] = err ? `${d}: (failed)` : `${d}: ${records?.[0] ?? "(no A record)"}`;
      inFlight--;
      if (nextIndex === domains.length && inFlight === 0) {
        console.table(results.map((v, i) => ({ index: i, result: v })));
      } else {
        pump(); // start another to keep the pipeline full
      }
    });
  }
}
pump();
```

- **Pros:** Fast **and** polite. Keeps only `MAX` operations in flight.

---

## 5) Reading Domains from a File + Collecting Results

```js
// file: examples/dns-from-file.js
const fs = require("fs");
const dns = require("dns");
const input_file = "input/domains.txt"; // one domain per line

fs.readFile(input_file, "utf8", (err, data) => {
  if (err) return console.error(err);

  const domains = data
    .split(/\r?\n/)          // handle both Windows and Unix newlines
    .map(s => s.trim())
    .filter(Boolean);        // drop blank lines

  const results = new Array(domains.length);
  let done = 0;

  domains.forEach((domain, i) => {
    dns.resolve(domain, (err, records) => {
      results[i] = err ? `${domain}: (failed)` : `${domain}: ${records?.[0] ?? "(no A record)"}`;
      if (++done === domains.length) {
        console.table(results.map((v, idx) => ({ index: idx, result: v })));
      }
    });
  });
});
```

**Alternative (strict order):** use the **sequential** or **limited concurrency** pumps shown above.

---

## 6) Compression with `zlib` (Deflate/Inflate)

### A) Compress (Deflate)

```js
// file: examples/deflate.js
const fs = require("fs");
const zlib = require("zlib");
const output_file = "./output/content.deflated";
const content = `Lorem ipsum dolor sit amet ... (long text here) ...`;

zlib.deflate(content, (err, buffer) => {
  if (err) return console.error(err);
  fs.writeFile(output_file, buffer, (err) => {
    if (err) return console.error(err);
    console.log(`File Written to "${output_file}"`);
    console.log(`Original Size: ${content.length}`);
    console.log(`New Size: ${buffer.length}`);
  });
});
```

> The compressed file is **binary** data.

### B) Decompress (Inflate)

```js
// file: examples/inflate.js
const fs = require("fs");
const zlib = require("zlib");
const input_file = "./input/content.deflated";

fs.readFile(input_file, null, (err, data) => { // `null` => raw Buffer
  if (err) return console.error(err);
  zlib.inflate(data, (err, buf) => {
    if (err) return console.error(err);
    console.log(buf.toString("utf8"));
    console.log("======================================");
    console.log(`Compressed Size   : ${data.length}`);
    console.log(`Decompressed Size : ${buf.length}`);
    console.log("======================================");
  });
});
```

---

## 7) Timers & Closures: `setTimeout` with `var` vs `let`

### Loop A (prints 10 ten times)

```js
// file: examples/timer-loop-var.js
{
  var i;
  for (i = 0; i < 10; i++) {
    setTimeout(() => console.log(i), 1000);
  }
}
// After 1s, logs: 10 10 10 10 10 10 10 10 10 10
```

- With `var`, there’s **one shared `i`**. After the loop, `i === 10`, and all callbacks see the **same** final value.

### Loop B (prints 0..9)

```js
// file: examples/timer-loop-let.js
for (let i = 0; i < 10; i++) {
  setTimeout(() => console.log(i), 1000);
}
// After 1s, logs: 0 1 2 3 4 5 6 7 8 9
```

- With `let`, each iteration has a **new binding** of `i`, so callbacks capture distinct values.

**Fix with `var`:** use an IIFE or pass a value into `setTimeout`:

```js
for (var i = 0; i < 10; i++) {
  ((j) => setTimeout(() => console.log(j), 1000))(i);
}
// or:
for (var i = 0; i < 10; i++) {
  setTimeout((j) => console.log(j), 1000, i);
}
```

---

## 8) OSI vs TCP/IP Models (quick, corrected overview)

> Your original notes mixed some layers. Here’s the clean version.

**OSI (7 layers):**
1. **Physical** — electrical/optical signaling, cables.
2. **Data Link** — frames on a local link (Ethernet, Wi‑Fi).
3. **Network** — end‑to‑end packet delivery across networks (IP).
4. **Transport** — process‑to‑process delivery, reliability (TCP, UDP).
5. **Session** — dialogs, checkpoints (rarely distinct on the modern internet).
6. **Presentation** — encoding, compression, encryption (TLS often considered here).
7. **Application** — protocols apps use (HTTP, DNS, SMTP).

**TCP/IP (Internet) model (4 layers commonly taught):**
1. **Link** (Physical + Data Link)
2. **Internet** (Network → IP)
3. **Transport** (TCP/UDP)
4. **Application** (Application/Presentation/Session combined)

**Key ideas:**
- **Abstraction** and **separation of concerns**: swap one layer’s implementation (e.g., Wi‑Fi → Ethernet) without rewriting others.
- **Presentation/session** are often **folded** into “Application” in practice.

**Fun historical “protocols”:**
- **Homing pigeons** — one‑way, slow, no ordering, loss‑prone, no encryption.
- **Hydraulic/optical semaphores** — faster line‑of‑sight relays, still limited reliability and capacity.

---

## 9) Practical Takeaways (TL;DR)

- Use **async APIs** (`fs`, `dns`, `zlib`, DB clients) to keep Node’s **main thread** free.
- **Callbacks** run on the **main thread** later; the slow work is done by **libuv/OS**.
- Order of async completions is **not guaranteed** unless you **enforce** it (sequential or limited concurrency).
- For **massive N**, prefer **limited concurrency** (semaphore/pool) to avoid overload.
- When you need the loop variable per iteration, use **`let`** or capture with a closure.

---

## 10) Extra: Promisified versions (optional)

If you prefer Promises/`async`–`await`, promisify the Node‑style callbacks:

```js
const { promisify } = require("util");
const dns = require("dns");
const resolveAsync = promisify(dns.resolve);

(async () => {
  try {
    const ips = await Promise.all([
      resolveAsync("qc.cuny.edu"),
      resolveAsync("cuny.edu"),
    ]);
    console.log(ips);
  } catch (e) {
    console.error(e);
  }
})();
```

(You can combine this with **p‑limit** style concurrency control if you’re using a library, or write your own small semaphore.)

---

**End of document.**