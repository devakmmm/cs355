# PHYSICAL LAYER

## COMMUNICATION PROTOCOLS (Continued)

### 🕊️ 776 BC — Homing Pigeon
- Used to deliver results of the **first ever Olympics** from one city to another.  
- **Unencrypted** — anyone could read the message.  
- **Unidirectional** — information flows in one direction only.  
- **Slow and unreliable** — pigeons could get lost or intercepted.  
- **No error detection or delivery guarantee** — sender wouldn’t know if the message arrived.  
- **No ordering** — multiple pigeons sent could arrive out of order.  

> ⚠️ *Represents a very early form of simplex communication — one-way and insecure.*

---

### 🔥 400 BC — Hydraulic Semaphore
- Each city had **identical semaphores** for signaling.  
- **Limited message size** — could only send predefined signals.  
- **Bidirectional** — both sides could send messages.  
- **Best used at night** (due to visibility of lights/torches).  
- **Limited distance** — could not go beyond the visible horizon.  
- **Poor encryption** — easy for others to interpret.  
- **Expensive** — required dedicated operators and labor.  

> 💡 *Improved directionality but still constrained by distance and manual operation.*

---

### ⚙️ Optical Telegraph (1790s France)
- Solved issues of **limited distance** and **message size**.  
- Could send messages **over very long distances**, very **fast**.  
- **Unlimited message size** (by chaining multiple coded signals).  
- **Distance scalability** — depends on the number of operators/stations.  
- **Usable both day and night**.  
- **Used mainly for military services**.  
- **End-to-end encryption (primitive)** — codebooks were kept only in the cities, not at the relay stations.  
- **First case of insider trading** in France — traders bribed operators to get early financial news.  
  - *(They targeted the operator right before the message reached the destination.)*  

> ✅ *Early example of secure, large-distance communication.*

---

# TOPIC 5 — PHYSICAL LAYER

The **Physical Layer** handles **bit-by-bit encoding of information** onto a physical medium such as cables or wireless signals.

> 💡 Defines *how bits are represented and transmitted* through hardware.

---

## TRANSMISSION MEDIA

### 1. 🧵 CABLES (Wired Media)
- Provide **point-to-point connections** (connect exactly two devices).  
- Data encryption is **optional** because physical access itself provides some security.  
- Common materials: **Copper** and **Fiber Optic**.  
- Can achieve **full-duplex** communication (simultaneous two-way transmission).  
- Example: A **mouse wire** only needs one sender, so it operates in **simplex mode**, not full-duplex.  

---

#### ⚡ COPPER CABLES
- Use **electrical current** to encode information.  
- Affected by **electromagnetic interference (EMI)** — e.g., thunderstorms.  
- Known as **twisted pair cables** because the two wires inside are twisted around each other.  
  - This cancels out electromagnetic fields and reduces noise/corruption.  
  - The term *pair* refers to the fact that signals are transmitted using two wires together (differential signaling).  

> ⚠️ *Susceptible to interference — twisting minimizes noise.*

---

#### 💡 FIBER OPTIC CABLES
- Encode data as **pulses of light**, hence operate at **near the speed of light** — fastest transmission medium.  
- Made of **glass tubes with reflective inner surfaces** (mirrors) so light cannot escape.  
- Immune to **electrical interference** — unaffected by thunderstorms.  
- Typically, **fiber comes to your house (FTTH)** but inside the house, it’s converted to copper or wireless for local use.  

> ✅ *Fastest and most reliable medium — ideal for long distances.*

---

## HARDWARE DEVICES

### 1. 🔌 Cables
- Provide **point-to-point** wired connections.

### 2. 📡 Antenna
- Used for wireless communication.

### 3. 🔄 Network Hub
- Acts like a **multi-port cable**, connecting multiple devices.  
- When it receives a signal on one port, it **duplicates** it and sends it to **all other ports**.  
- Creates a **collision domain** — if two devices send signals simultaneously, the signals interfere and data is corrupted.  

> ⚠️ *Causes data collisions — solved later with CSMA/CD.*

---

### 🚦 Solution to Hub Collisions — CSMA (Carrier Sense Multiple Access)

#### Version 1: CSMA
```js
function send(message) {
    while (receiving_data) {
        wait();
    }
    os.write(message);
}
```
- **Meaning:**  
  - If the device senses another transmission (receiving data), it waits.  
  - Once the channel is free, it sends the message.  
- This effectively makes the medium **half-duplex** — only one sender transmits at a time.  

> ⚙️ *Helps reduce collisions but still sequential.*

---

#### Version 2: CSMA/CD (Carrier Sense Multiple Access with Collision Detection)
```js
function send(message, i = 0) {
    while (receiving_data) {
        wait();
    }
    os.write(message[i]);  // send smallest chunk of the message
    send(message, i + 1);  // recursively send next chunk
}
```
- **Meaning:**  
  - The sender transmits **one chunk at a time** and continuously checks for collisions.  
  - If another sender is detected, it waits and retries.  
  - Reduces collision probability and increases network efficiency.  

> ✅ *Used in Ethernet before network switches became standard.*

---

## 📶 WIRELESS COMMUNICATION
- **Omnidirectional** — signals are broadcast in all directions.  
- **Must be encrypted** — anyone nearby can intercept signals.  
- **Half-duplex operation** — only one device can transmit at a time, but switching happens in **picoseconds**, making it seem simultaneous.  
- **Lossy medium** — signals weaken or get lost due to interference.  

> 📊 A wireless channel is considered **excellent** if more than **60% of messages sent are successfully received.**

---

### 📨 ACKNOWLEDGMENT MESSAGE
- A short **response message** sent by the receiver to confirm it successfully received data.  
- Used in reliable communication protocols (e.g., TCP).  
- Helps implement **error detection and retransmission** if no acknowledgment is received.

> ✅ *Ensures message reliability and integrity.*

---

## ⚙️ PHYSICAL PROPERTIES
The **physical properties** of the transmission medium (like electrical, optical, or radio characteristics) determine what **protocols** and **encodings** can be used on top of it.

> 💡 *The medium defines the limits of communication speed and reliability.*

---

# CHANNEL TYPES

### ➡️ SIMPLEX
- **Unidirectional communication** — one device always sends, the other always receives.  
- Example: Keyboard → Computer.

### 🔁 DUPLEX
- **Bidirectional communication** — both devices can send and receive.

#### 🕐 Half-Duplex
- Both devices can transmit, but **only one at a time**.  
- Example: Walkie-talkies.

#### ⚡ Full-Duplex
- Both devices can **send and receive simultaneously**.  
- Example: Modern Ethernet, phone calls.
