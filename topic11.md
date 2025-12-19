# Topic 11 — Streams & Sockets  
**CS355 — Complete Merged Notes (Lecture + Personal Notes + freeCodeCamp Link)**  
**Reference:** https://www.freecodecamp.org/news/node-js-streams-everything-you-need-to-know-c9141306be93/

---

## What is a Stream? (Definition + Data Structure)

A **stream** is a **data structure** that allows us to consume **large (potentially infinite) amounts of data** using a **small, fixed amount of memory**, as long as the data can be **decomposed into chunks**.

Instead of loading all data into memory at once, streams:
- break data into **chunks**
- process one chunk at a time
- rely on **buffers** and **queues**

This is critical when:
- the data source is extremely large (GBs, TBs, or infinite)
- the device has limited memory
- data arrives over time (network traffic, sockets, video streams)

As long as the data is decomposable, streams allow **infinite-length processing**.

---

## Why Streams Exist (Lecture Diagram Meaning)

Traditional APIs like `fs.readFile()` attempt to load the **entire dataset into memory** before processing. This approach:
- wastes memory
- fails for large files
- blocks execution until completion

Streams solve this by:
- reading data incrementally
- keeping memory usage constant
- allowing processing to begin immediately

This makes streams ideal for:
- video/audio streaming
- file copying
- HTTP
- TCP sockets

---

## Stream as a Data Structure (Lecture Emphasis)

A stream represents a **flow of data** between a source and a destination. Internally, it is composed of:
- **chunks** (small pieces of data)
- **buffers** (temporary storage)
- **queues** (for managing output flow)

Streams decouple the **producer** of data from the **consumer**, allowing them to operate at different speeds safely.

---

## Stream Internals

### Chunks
- Streams operate on **chunks**, not entire datasets
- A chunk is typically:
  - a `Buffer` (binary data)
  - or a string (if encoding is set)
- Chunk size is controlled indirectly by buffering rules

### Buffer
- Buffers temporarily store chunks in memory
- Default buffer size is approximately **64KB**
- Configurable using `highWaterMark`
- Prevents the system from loading all data into memory

### Queue (Writable Streams)
- Writable streams maintain a **queue**
- Data waits in the queue until the destination is ready
- Prevents overwhelming slow destinations

---

## Types of Streams in Node.js

Node.js defines **four fundamental stream types**.

---

## 1. Readable Streams

### Purpose
A **readable stream** allows data to flow **from a source into your program**.

### Characteristics
- Uses an internal buffer
- Emits events:
  - `"data"` when a chunk is available
  - `"end"` when no more data remains

### Data Flow
```
Source → Buffer → "data" events → "end"
```

### APIs
- `rs.on("data", chunk)`
- `rs.on("end", callback)`
- `rs.pipe(destination)`

### Implementation Example
```js
const fs = require("fs");

const rs = fs.createReadStream("bigfile");

rs.on("data", chunk => {
  // process chunk
});

rs.on("end", () => {
  // finished reading
});
```

### Examples
- Reading a large file
- Streaming video frames
- Reading HTTP request bodies
- Measuring bandwidth using `chunk.length`

---

## 2. Writable Streams

### Purpose
A **writable stream** allows data to flow **from your program to a destination**.

### Characteristics
- Maintains an internal **queue**
- Accepts data via `write()`
- Signals completion using `end()`

### Data Flow
```
data → queue → destination
```

### APIs
- `ws.write(data)`
- `ws.end()`

### Implementation Example
```js
const ws = fs.createWriteStream("output.txt");

ws.write(chunk);
ws.end();
```

### Destinations
- Files
- `process.stdout`
- Network sockets

---

## 3. Duplex Streams

### Purpose
A **duplex stream** is both readable and writable, allowing **bidirectional communication**.

### Lecture Key Statement
> A socket is the other side of a TCP connection and is a **duplex stream**.

### Characteristics
- Two independent data flows
- Reading and writing do not depend on each other

### APIs
- `socket.on("data", chunk)`
- `socket.write(data)`

### Examples
- TCP sockets
- Client–server communication

---

## 4. Transform Streams

### Purpose
A **transform stream** is a special duplex stream where the output is a **transformation of the input**.

### Behavior
- Reads data
- Modifies it
- Writes transformed data

### Examples
- Compression (`zlib`)
- Encryption
- Parsing and filtering streams

---

## Backpressure (freeCodeCamp Emphasis)

### Definition
**Backpressure** occurs when a **writable stream cannot keep up** with the readable stream producing data.

### Problem
If not handled, fast producers can overwhelm memory.

### Node.js Solution
Using:
```js
rs.pipe(ws);
```

Node.js automatically:
- pauses the readable stream when the writable queue is full
- resumes it when the writable stream drains
- prevents memory overflow

This is why `pipe()` is safer than manual read/write loops.

---

## Streams vs fs.readFile (Critical Exam Comparison)

### fs.readFile
- Loads entire file into memory
- Blocks execution until complete
- Unsafe for large files

```js
fs.readFile("input", "utf-8", (err, data) => {
  fs.writeFile("copy", data, () => {});
});
```

### Streams
- Process data chunk-by-chunk
- Use constant memory
- Safe for very large or infinite data

```js
rs.pipe(ws);
```

---

## Two Required Examples of Streams

### Example 1: File Copy Using Streams
- Readable stream: `fs.createReadStream("a")`
- Writable stream: `fs.createWriteStream("b")`
- Data transferred chunk-by-chunk
- Memory usage remains constant regardless of file size

---

### Example 2: TCP Socket Communication

#### Connection
- Server listens on port `3000`
- Client connects
- OS assigns an **ephemeral source port**

#### Socket
- Represents one endpoint of a TCP connection
- Is implemented as a **duplex stream**

#### APIs
```js
socket.write(data);
socket.on("data", chunk);
```

#### Data Flow
```
Client socket ⇄ Server socket
```

---

## Socket Summary (Lecture Notes)

- A socket is the **stream abstraction over TCP**
- Each side of a TCP connection owns a socket
- Sockets are duplex streams
- Enable real-time, bidirectional communication

---
### Underlying Data Structure of Streams, Implementations, and Examples (10 Points)

1. The underlying data structure of a stream is a **flow-based data structure** that represents data moving incrementally from a source to a destination rather than as a single in-memory object.

2. Streams operate on **chunks of data**, which are small pieces of the overall dataset that are processed sequentially instead of all at once.

3. These chunks are temporarily stored in **buffers**, which provide short-term memory to handle differences in speed between data producers and data consumers.

4. The size of the buffer is controlled internally (default around **64KB** in Node.js) and can be configured using the `highWaterMark` property to manage memory usage.

5. Writable streams additionally use an internal **queue** data structure to store chunks that are waiting to be written when the destination is slow or busy.

6. The combination of chunks, buffers, and queues allows streams to process **very large or even infinite data sources** using a small, fixed amount of memory.

7. Streams in Node.js are implemented using four main abstractions: **Readable**, **Writable**, **Duplex**, and **Transform** streams, all built on top of the core stream module.

8. Readable streams implement logic to **produce data**, while writable streams implement logic to **consume data**, such as reading from or writing to files or network connections.

9. Duplex streams implement both readable and writable behaviors simultaneously, which is why **TCP sockets** are implemented as duplex streams.

10. Two concrete examples of streams are a **file stream** created using `fs.createReadStream()` for reading large files and a **TCP socket stream** that enables bidirectional communication between a client and a server.


### Underlying Data Structure, Types, Implementations, and Examples of Streams

The underlying data structure of a stream is a **flow-based data structure** designed to process **large or potentially infinite data sources** using a **small, fixed amount of memory**. Instead of loading an entire dataset into memory, streams break data into **chunks** and process those chunks incrementally. These chunks are temporarily stored in **buffers**, which smooth out differences in speed between data producers and consumers. Writable streams also maintain an internal **queue** that holds chunks waiting to be written when the destination is slow. This combination of chunks, buffers, and queues allows streams to efficiently handle large files, network traffic, and continuous data flows without exhausting memory.

Node.js implements four main types of streams, each differing in how data flows through them. A **readable stream** allows data to flow from a source into the program, such as reading a file or receiving an HTTP request. A **writable stream** allows data to flow from the program to a destination, such as writing to a file or sending an HTTP response. A **duplex stream** supports both reading and writing simultaneously with two independent data flows; TCP sockets are implemented as duplex streams because data can be sent and received at the same time. A **transform stream** is a special type of duplex stream that modifies data as it passes through, such as compression or encryption.

Streams in Node.js are implemented using the core **stream module**, which provides abstractions for readable, writable, duplex, and transform streams. These abstractions handle buffering, backpressure, and flow control internally, making stream-based I/O safe and memory-efficient.

Two common examples of streams are a **file stream** created using `fs.createReadStream()` to read large files incrementally and a **TCP socket stream**, which enables bidirectional communication between a client and a server. Together, these examples demonstrate how streams serve as a fundamental abstraction for efficient file and network I/O in Node.js.


