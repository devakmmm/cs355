# TOPIC 6 — DATA LINK LAYER

The **Data Link Layer** is the layer immediately above the Physical Layer.  
It ensures **reliable transmission** of data between two directly connected (adjacent) devices.

---

## 🎯 Responsibilities of the Data Link Layer

1. **Encoding and Decoding of Messages**
   - Converts **digital bits** into **analog signals** and vice versa.
   - Ensures the data can travel through the physical medium.

2. **Message Framing**
   - Detects the **start and end** of each message.
   - Frames separate data packets for error checking and synchronization.

3. **Hop-to-Hop Delivery**
   - Responsible for **data transfer between two adjacent nodes** (devices directly connected).
   - Commonly includes **wireless** and **wired** devices.  
   - It is **single-hop only** — meaning data is transferred from one device to its **immediate neighbor**.

> 💡 **Single Hop Explanation:**  
> In a path like `[Computer 1] → [Router] → [Computer 2]`,  
> each link is one *hop*. The Data Link Layer handles communication **only between two directly connected devices** (e.g., Computer 1 ↔ Router).  
> Higher layers handle multi-hop delivery.

---

## ⚙️ PROTOCOLS

### 🧷 Ethernet (IEEE 802.3)
- Used for **wired connections** (point-to-point).  
- Enables **high-speed data transmission** through cables.  
- Simple header-based protocol → **efficient and fast**.  
- **No acknowledgments** required — reliable within the physical medium.

#### 🧩 Preamble
- first **8 bytes long** sequence of alternating `0`s and `1`s → `01010101...`
- Purpose: **synchronization** between sender and receiver.
- The **last byte** is the **SFD (Start Frame Delimiter)** — marks start of actual data.

> ⚡ *Preamble helps both sides align timing and detect when data transmission begins.*

---

### 🔖 MAC Address (Most Important for Exam)
- **Globally unique** hardware address that identifies every network card.  
- **Size:** 48 bits = 6 bytes → ~281 trillion possible combinations.  
- Example: `A0:2C:33:00:F9:0A`

#### 📘 MAC Address Format
| Octets | Description |
|:-------|:-------------|
| First 3 | OUI (Organizationally Unique Identifier) |
| Last 3 | NIC (Network Interface Component) |

> 💡 *OUI identifies the manufacturer, while NIC identifies the specific device within that organization.*

#### 🧭 IEEE Management System
- **IEEE** (Institute of Electrical and Electronics Engineers) manages MAC address assignments.  
  - Assigns unique **OUI blocks** to manufacturers.  
  - Maintains **global MAC address registry**.  
  - Requires **registration and fees** from companies.  
  - Prevents **address duplication** worldwide.

#### 🏭 Manufacturer's Role
- Receives OUI from IEEE.  
- Generates unique NIC portions internally.  
- Ensures uniqueness **within their assigned range**.

> ✅ *Guarantees no two devices globally share the same MAC address.*

---

### ⚠️ Side Effects of MAC Layer
- If a MAC address is spoofed or cloned, devices may face network conflicts.  
- Hence, **MAC filtering** and encryption are important for security.

> 💡 *Data Link Layer doesn’t deliver data to the final destination — it brings it one hop closer.*

---

## 🌐 Ethertype Field
- Used to **identify the protocol** of the payload (type of data carried).

| Protocol | Ethertype | Description |
|:----------|:-----------|:-------------|
| IPv4 | 0x0800 | Internet Protocol version 4 |
| IPv6 | 0x86DD | Internet Protocol version 6 |
| ARP | 0x0806 | Address Resolution Protocol |
| Ethernet + 802.1Q | 0x8100 | VLAN tagging and QoS |

### 🧱 VLAN (Virtual LAN)
- Allows **logical separation** of devices on the same physical switch.  
- Improves **security** and **network organization**.  
- Example: VLAN 10 and VLAN 20 cannot talk without routing.

### 🎚️ QoS (Quality of Service)
- Assigns **priority** to different types of traffic.  
- Helps avoid congestion and ensures **voice/video data** is prioritized.  
- Example: Cloud backups (low priority) vs. live video calls (high priority).

> ✅ *802.1Q provides VLAN + QoS — logical segmentation and prioritized traffic.*

---

## 🧱 PAYLOAD
- The **actual data** (e.g., IP packet) encapsulated inside the Ethernet frame.

---

## 🔍 FCS / CRC — Frame Check Sequence
- Ensures **data integrity** by detecting errors during transmission.
- Uses a **hashing algorithm** (CRC-32).

### 🔢 Key Properties of CRC32
1. **Same Input → Same Output**  
   - Identical frame = identical 32-bit FCS value.

2. **Avalanche Effect**  
   - Tiny input changes (even 1 bit) drastically change hash output.  
   - Example:  
     - “Hello” → `0x2FA4`  
     - “Hallo” → `0x9B3C`

3. **Error Detection**  
   - Detects even single-bit errors or burst errors.  
   - If message “10101” becomes “100000”, CRC detects mismatch.

> 💡 *CRC-32 is excellent at detecting burst errors (multiple-bit corruption).*

---

## 🕓 Interframe Gap
- A **short delay** between two frames to give devices time to process messages.  
- Prevents overlapping transmissions.

---

## 📶 Wi-Fi (IEEE 802.11)
- Used for **wireless connections**.  
- Transmits data via **radio waves** (omnidirectional).  
- Must use **encryption** (since anyone nearby can receive signals).  
- Complex protocol — multiple message types, each with its own headers.  
- Every **30 seconds**, routers send a **Beacon Message** containing metadata that assists Wi-Fi delivery.

> 💡 *Beacon frames help devices discover and maintain connections.*

### 🔍 How Phones Connect to Wi-Fi
- Devices constantly send **Probe Requests**: “Is home Wi-Fi nearby?”  
- Router replies with **Probe Responses** → triggers **association process**.

> ✅ *This probe-exchange is metadata that establishes a connection handshake.*

### 🧱 Block Acknowledgment (Block ACK)
- Wi-Fi uses **Block ACK** to confirm receipt of multiple frames at once (improves speed).  
- Ethernet doesn’t need it since it’s **not lossy**.

> ⚡ *Wireless is half-duplex and lossy; Ethernet is full-duplex and reliable.*

---

## 🔧 HARDWARE DEVICES

### 🔄 Network Switch
- Replaced the older **network hub**.  
- Adds **CPU and memory** → resolves collision domain issues.  
- Operates at the **Data Link Layer**, forwarding frames based on **MAC addresses**.

> 💡 *Collision Domain:* an area where two signals interfere if transmitted simultaneously. Switches isolate these domains for each port.

### 🧠 Why Learn Hubs?
- Hubs are **Physical Layer** devices — they forward signals blindly.  
- Switches are **Data Link Layer** devices — they inspect **MAC addresses**.  
- Learning both shows how **deeply** each device interacts with the message.

---

## 🌍 Router (Network Layer Hardware Device)
- Operates above the Data Link Layer.  
- Uses **IP addresses** to route data between networks.

> ⚙️ Even though hubs are obsolete, their **collision management concepts (CSMA)** still apply.

---

### 🔁 CSMA and CSMA/CA in Wireless

#### Version 1 — CSMA
```js
function send(message, i = 0) {
    while (receiving_data) {
        wait();
    }
    os.write(message[i]); // send smallest chunk
    send(message, i + 1);
}
```
- Problem: If all devices send simultaneously and detect collision, they **stop at the same time** → try again → repeat.  
- This results in **Livelock** (infinite retry loop).

#### Version 2 — CSMA/CA (Collision Avoidance)
```js
function send(message, i = 0) {
    while (receiving_data) {
        wait(random); // wait random time to avoid synchronization
    }
    os.write(message[i]);
    send(message, i + 1);
}
```
- Adds **randomized waiting time** to prevent all devices from retrying at the same moment.  
- Reduces collisions drastically.

> ⚠️ *Wireless can’t perfectly detect collisions (signals overlap invisibly), so avoidance is crucial.*

---

✅ **Summary:**
- **Ethernet (802.3)** — Wired, fast, reliable, no ACKs.  
- **Wi-Fi (802.11)** — Wireless, lossy, needs ACKs and encryption.  
- Both are **Data Link Layer protocols** designed for different environments.
