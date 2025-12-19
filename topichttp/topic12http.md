# HTTP (HyperText Transfer Protocol)

## Core Characteristics

### Text-Based
- HTTP messages are plain text.
- Requests and responses consist of **headers** and an **optional body**.
- This makes HTTP easy to inspect and debug (browser dev tools, curl, Postman).

### Client–Server Protocol
- HTTP follows a strict client–server architecture.

#### Clients Initiate All Communication
1. The **client** (browser, app, Postman) always sends the first message.
2. The **server never initiates** communication.
3. The server only **responds** to client requests.
4. This asymmetry defines the client–server model.

### Stateless
- Each request is independent.
- The server does **not remember** prior requests.
- State must be added explicitly (cookies, sessions, JWTs).

### Two Types of Messages
1. **Request**
   - Headers
   - Optional body
2. **Response**
   - Headers
   - Optional body

---

## HTTP Status Code Categories

### 100-level — Informational
- Request received, processing continues.
- Example:
  - `100 Continue`

### 200-level — Success
- Request succeeded.
- Example:
  - `200 OK`
  - `201 Created`

### 300-level — Redirection
- Client must take additional action (usually another request).
- Example:
  - `301 Moved Permanently`
  - `302 Found`

---

## Headers vs Body

### Headers
- Metadata about the request or response.
- Examples:
  - `Content-Type`
  - `Content-Length`
  - `Host`
  - `User-Agent`

### Body
- Actual payload/data.
- Examples:
  - HTML
  - JSON
  - File data
- **Optional** — not all requests or responses include a body.

### Is There Always a Body in a Response?
- **No.**
- Examples with no body:
  - `204 No Content`
  - Responses to `HEAD` requests
  - Some redirects

Example body placeholder:
