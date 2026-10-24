# Node.js + MongoDB + JWT Starter (Beginner Friendly)

A small, simple backend project that teaches the **most asked topics in Node.js interviews**:

- Signup & Login (email + password)
- Password hashing (bcrypt)
- JWT **Access Token** + **Refresh Token** (+ refresh API, logout)
- Protected routes using middleware
- Products API with **pagination (10 per page)**
- Cart and favorites APIs (per user)
- Protected product reviews
- Profile API

---

## 1. Tech Stack

| Tool | Why we use it |
|------|---------------|
| **Node.js** | Runs JavaScript on the server |
| **Express** | Makes creating APIs easy (routes, middleware) |
| **MongoDB + Mongoose** | Database + a friendly way to define data models |
| **bcryptjs** | Hash passwords (never store plain passwords) |
| **jsonwebtoken** | Create & verify JWT tokens |
| **dotenv** | Keep secrets in a `.env` file |

---

## 2. How to Run

**Prerequisites:** Node.js 18+ and MongoDB running locally (or a free MongoDB Atlas URL).

```bash
npm install
# .env is already provided (edit MONGO_URI if you use Atlas)
npm run dev      # auto-restarts on change (nodemon)
# or
npm start
```

Server starts at `http://localhost:5000`.

---

## 3. Folder Structure (and what each part does)

```
node-jwt-starter/
├── server.js                  # Entry point: creates app, connects DB, registers routes
├── .env                       # Secrets & config (not committed to git)
└── src/
    ├── config/db.js           # MongoDB connection
    ├── models/                # Database schemas (shape of data)
    │   ├── User.js
    │   ├── Product.js
    │   └── Cart.js
    ├── routes/                # URL -> controller mapping
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── productRoutes.js
    │   └── cartRoutes.js
    ├── controllers/           # Business logic (what happens for each API)
    │   ├── authController.js
    │   ├── userController.js
    │   ├── productController.js
    │   └── cartController.js
    ├── middleware/
    │   ├── auth.js            # "protect": verifies the access token
    │   └── errorHandler.js    # One place to handle all errors
    └── utils/
        ├── token.js           # create access / refresh tokens
        └── asyncHandler.js    # removes try/catch repetition
```

### The request journey (very important to explain!)

```
Client  ──►  Route  ──►  Middleware (protect)  ──►  Controller  ──►  Model  ──►  MongoDB
                                                         │
Client  ◄──────────────────  JSON response  ◄────────────┘
```

- **Route** decides *which* function handles a URL.
- **Middleware** runs before the controller (e.g. checks login).
- **Controller** has the logic.
- **Model** talks to the database.

---

## 4. Core Concepts

### 4.1 Password hashing
We **never** save the real password. `bcrypt` converts `"123456"` into a long random-looking string.
Hashing is **one-way** — you can't reverse it. On login we hash the typed password and compare.
This is done in `User.js` using a `pre('save')` hook.

### 4.2 What is JWT?
JWT (JSON Web Token) is a signed string the server gives after login. It has 3 parts:

```
HEADER . PAYLOAD . SIGNATURE
```

- **Payload** holds data (we store the user `id`).
- **Signature** is created using our secret key. If someone changes the payload, the signature breaks and the server rejects it.
- The server stays **stateless** — it doesn't need to store sessions; it just verifies the token.

> ⚠️ Payload is only *encoded*, not *encrypted*. Never put passwords in it.

### 4.3 Access Token vs Refresh Token

| | Access Token | Refresh Token |
|---|---|---|
| Purpose | Call protected APIs | Get a new access token |
| Lifetime | **Short** (15 min) | **Long** (7 days) |
| Sent | In every request (`Authorization` header) | Only to `/api/auth/refresh-token` |
| Secret | `ACCESS_TOKEN_SECRET` | `REFRESH_TOKEN_SECRET` (different!) |
| Stored in DB? | No | Yes (to allow logout/revoke) |

**Why two tokens?**
If an access token is stolen, it's useful to the attacker for only 15 minutes.
The user still has a smooth experience because the app silently uses the refresh token to get a new access token, so they don't have to login again every 15 minutes.

---

## 5. Authentication Flow (explain this in interviews)

```
1) SIGNUP / LOGIN
   Client ── email + password ──► Server
   Server: hash/compare password, create accessToken + refreshToken,
           save refreshToken in DB
   Client ◄── accessToken + refreshToken ── Server

2) CALL A PROTECTED API
   Client ── Authorization: Bearer <accessToken> ──► Server
   protect middleware: verify token → find user → req.user = user → controller runs
   Client ◄── data ── Server

3) ACCESS TOKEN EXPIRES (after 15 min)
   Client ── Bearer <expired token> ──► Server
   Client ◄── 401 "Access token expired" ── Server

4) REFRESH
   Client ── refreshToken ──► POST /api/auth/refresh-token
   Server: verify refresh token → compare with the one saved in DB
           → issue NEW accessToken + NEW refreshToken (rotation) → save new one
   Client ◄── new tokens ── Server
   Client retries the failed request with the new access token ✅

5) LOGOUT
   Client ── POST /api/auth/logout ──► Server deletes refreshToken from DB
   Old refresh token can no longer be used.

6) REFRESH TOKEN EXPIRED (after 7 days) → user must login again.
```

---

## 6. API Reference

Base URL: `http://localhost:5000`

Protected APIs need this header:
```
Authorization: Bearer <accessToken>
```

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 1 | POST | `/api/auth/signup` | No | Create account |
| 2 | POST | `/api/auth/login` | No | Login |
| 3 | POST | `/api/auth/refresh-token` | No | Get new tokens |
| 4 | POST | `/api/auth/logout` | Yes | Logout |
| 5 | GET | `/api/users/me` | Yes | My profile |
| 6 | POST | `/api/products` | Yes | Insert a product |
| 7 | GET | `/api/products?page=1` | Yes | List products (10/page) |
| 8 | GET | `/api/cart` | Yes | My cart |
| 9 | POST | `/api/cart/add` | Yes | Add product to cart |
| 10 | DELETE | `/api/cart/remove/:productId` | Yes | Remove product from cart |
| 11 | GET | `/api/favorites` | Yes | My favorite products |
| 12 | POST | `/api/favorites` | Yes | Add a favorite (`productId`) |
| 13 | DELETE | `/api/favorites/:productId` | Yes | Remove a favorite |
| 14 | GET | `/api/reviews/:productId` | Yes | List reviews for a product |
| 15 | POST | `/api/reviews` | Yes | Review a product (`productId`, `rating`, optional `comment`) |
| 16 | PATCH | `/api/reviews/:reviewId` | Yes | Update your review |
| 17 | DELETE | `/api/reviews/:reviewId` | Yes | Delete your review |

Favorites and reviews are scoped to the authenticated user. A user can submit only one review per product and can update or delete only their own reviews. Ratings must be integers from 1 to 5.

### 1. Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"123456"}'
```
Response `201`:
```json
{
  "success": true,
  "message": "Signup successful",
  "user": { "id": "665f...", "username": "john", "email": "john@example.com" },
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi..."
}
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}'
```
Returns the same shape as signup.

### 3. Refresh token
```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<your refresh token>"}'
```
Response:
```json
{ "success": true, "accessToken": "new...", "refreshToken": "new..." }
```
> The old refresh token stops working after this (token rotation). Always save the new one.

### 4. Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer <accessToken>"
```

### 5. Profile (fetch user)
```bash
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer <accessToken>"
```
```json
{ "success": true, "user": { "id": "665f...", "username": "john", "email": "john@example.com", "createdAt": "..." } }
```

### 6. Insert a product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Keyboard","price":999,"description":"Mechanical keyboard","stock":25}'
```

### 7. Get products with pagination
```bash
curl "http://localhost:5000/api/products?page=1"
curl "http://localhost:5000/api/products?page=2"
```
Response:
```json
{
  "success": true,
  "currentPage": 1,
  "totalPages": 3,
  "totalProducts": 25,
  "hasNextPage": true,
  "hasPrevPage": false,
  "products": [ ... 10 items ... ]
}
```
**How pagination works:**
```
skip  = (page - 1) * 10
limit = 10
page 1 → skip 0  (items 1–10)
page 2 → skip 10 (items 11–20)
page 3 → skip 20 (items 21–30)
totalPages = ceil(totalProducts / 10)
```

### 8. My cart
```bash
curl http://localhost:5000/api/cart -H "Authorization: Bearer <accessToken>"
```

### 9. Add to cart
```bash
curl -X POST http://localhost:5000/api/cart/add \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"productId":"<product _id>","quantity":2}'
```
Adding the same product again increases its quantity.

### 10. Remove from cart
```bash
curl -X DELETE http://localhost:5000/api/cart/remove/<productId> \
  -H "Authorization: Bearer <accessToken>"
```

---

## 7. Quick Test Order (try it yourself)

1. Signup → copy `accessToken` and `refreshToken`
2. `GET /api/users/me` with the access token
3. Create 12+ products with `POST /api/products`
4. `GET /api/products?page=1` then `?page=2`
5. Add a product to the cart → `GET /api/cart`
6. Test refresh: call `/api/auth/refresh-token` with your refresh token
7. Logout, then try the refresh token again → it must fail ✅

*Tip: To test token expiry quickly, set `ACCESS_TOKEN_EXPIRES_IN=30s` in `.env`.*

---

## 8. Common Interview Questions (with short answers)

**Q: What is middleware in Express?**
A function that runs between the request and the response. It can read/modify `req`/`res`, stop the request, or call `next()`. Example: our `protect` middleware.

**Q: What is JWT and why use it?**
A signed token that proves who the user is. The server doesn't store sessions (stateless), so it scales easily.

**Q: Why not store the plain password?**
If the DB leaks, all passwords leak. We store a bcrypt hash — one-way and salted.

**Q: Difference between access and refresh tokens?**
Access = short-lived, used on every request. Refresh = long-lived, used only to get new access tokens.

**Q: What happens when the access token expires?**
The server returns 401. The client calls the refresh API, gets new tokens, and retries the request.

**Q: Why store the refresh token in the DB?**
So we can revoke it (logout, stolen token). We compare the received token with the saved one.

**Q: What is refresh token rotation?**
Every refresh gives a new refresh token and invalidates the old one. If an old token is reused, it's rejected.

**Q: Where should the client store tokens?**
Best: refresh token in an `httpOnly` secure cookie; access token in memory. `localStorage` is easier but exposed to XSS attacks.

**Q: How does pagination work in MongoDB?**
`.skip((page-1)*limit).limit(limit)` plus `countDocuments()` to calculate total pages. For very large data, cursor-based pagination is faster.

**Q: What is `select: false` in the schema?**
The field is hidden from query results by default (password, refreshToken), so we don't leak it by mistake.

**Q: What is `populate`?**
Replaces an ObjectId reference with the actual document (like a JOIN). We use it to show product name & price inside the cart.

**Q: Why `asyncHandler`?**
Express 4 doesn't catch errors from async functions automatically. The wrapper forwards errors to the central error handler.

**Q: 401 vs 403?**
401 = not authenticated (no/invalid token). 403 = authenticated but not allowed.

---

## 9. Ideas for Improvement (next steps)

- Input validation with `Joi` / `express-validator`
- Hash the refresh token before saving in DB
- Send refresh token via `httpOnly` cookie
- Roles (admin can add products, users can only view)
- Rate limiting (`express-rate-limit`) and `helmet`
- Update cart quantity, clear cart, checkout / orders
- Product update, delete, search and filters
- Unit tests with Jest + Supertest
# e_commerce_nodejs_app
