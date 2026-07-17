# Phase-Wise Implementation Plan: Eazy Shop (Virtual POS)

> **Goal**: Build a working software prototype of the Eazy Shop Virtual POS system that demonstrates the complete queue-free shopping experience — from barcode scanning to exit verification — without requiring any physical hardware.

---

## Phase Prerequisites at a Glance

This section summarizes **what must be ready** before you begin each phase. Use it as a checklist to ensure nothing is missed.

---

### Phase 1 — Setup & Foundation
> **Depends on**: Nothing (this is the starting point)

| Category | What's Needed |
|:---------|:--------------|
| **Tools** | Node.js (v18+), npm, Git installed on your machine |
| **npm Packages (Backend)** | `express`, `cors`, `sqlite3` |
| **npm Packages (Frontend)** | `react`, `react-dom`, `vite`, `@vitejs/plugin-react` |
| **Database** | SQLite file (`shop.db`) — created automatically by the backend |
| **Tables Created** | `products`, `users`, `orders` |
| **Seed Data** | 10–15 sample products with real-looking barcodes |
| **Config Files** | `.env` with `PORT`, `DB_PATH`, `JWT_SECRET` |

---

### Phase 2 — Authentication & User Management
> **Depends on**: Phase 1 fully complete

| Category | What's Needed |
|:---------|:--------------|
| **From Phase 1** | Running Express server, `users` table in SQLite |
| **npm Packages (Backend)** | `bcryptjs` (password hashing), `jsonwebtoken` (JWT tokens) |
| **npm Packages (Frontend)** | `react-router-dom` (page routing) |
| **Database** | `users` table must have columns: `id`, `name`, `email`, `password`, `role`, `createdAt` |
| **API Endpoints Built** | `POST /api/auth/register`, `POST /api/auth/login` |
| **UI Screens Built** | Splash, Login, Register (App) · Admin Login (Admin) |

---

### Phase 3 — Product Catalog & Store Selection
> **Depends on**: Phase 1 (DB + server) and Phase 2 (auth middleware)

| Category | What's Needed |
|:---------|:--------------|
| **From Phase 1** | `products` table seeded with sample data |
| **From Phase 2** | JWT auth middleware to protect admin product management routes |
| **Database** | `products` table with columns: `id`, `name`, `price`, `discountedPrice`, `weight`, `imageUrl`, `category`, `stock` |
| **API Endpoints Built** | `GET /api/products/:barcode`, `GET /api/products`, `POST /api/products` (admin), `PUT /api/products/:id` (admin), `DELETE /api/products/:id` (admin) |
| **UI Screens Built** | Store Selection, Home/Start Shopping (App) · Product List, Add/Edit Product (Admin) |

---

### Phase 4 — Barcode Scanning & Smart Cart
> **Depends on**: Phase 3 (product lookup API)

| Category | What's Needed |
|:---------|:--------------|
| **From Phase 3** | Working `GET /api/products/:barcode` endpoint that returns product details |
| **From Phase 2** | Authenticated user session (JWT) to tie cart to a user |
| **Database** | New `cart_items` table or in-memory cart state: `userId`, `productId`, `quantity` |
| **npm Packages (Frontend)** | `html5-qrcode` *(optional, for camera-based scanning)* |
| **API Endpoints Built** | `POST /api/cart/add`, `GET /api/cart`, `PUT /api/cart/update`, `DELETE /api/cart/remove/:itemId` |
| **UI Screens Built** | Barcode Scanner, Product Details Popup, Live Cart (App) |

---

### Phase 5 — Checkout, Payment & Receipt
> **Depends on**: Phase 4 (cart API) and Phase 3 (inventory data)

| Category | What's Needed |
|:---------|:--------------|
| **From Phase 4** | Working cart with items — `GET /api/cart` returns the user's current cart |
| **From Phase 1** | `orders` table with columns: `id`, `userId`, `items`, `totalAmount`, `status`, `createdAt` |
| **Database** | `orders` table must support `status` values: `PENDING`, `PAID`, `CANCELLED` |
| **npm Packages (Backend)** | *None new* — payment is mocked for the free prototype |
| **npm Packages (Frontend)** | `qrcode.react` *(to render Exit QR codes on screen)* |
| **API Endpoints Built** | `POST /api/orders`, `POST /api/orders/:id/pay`, `GET /api/orders/:id/receipt` |
| **Inventory API** | `GET /api/inventory` (stock levels), stock auto-deduction on payment |
| **UI Screens Built** | Review & Checkout, Payment Selection, Payment Success, Digital Receipt, Exit QR Code (App) |

---

### Phase 6 — Admin Dashboard & Exit Verification
> **Depends on**: Phase 5 (orders & inventory data exist)

| Category | What's Needed |
|:---------|:--------------|
| **From Phase 5** | Populated `orders` table with transaction data, updated `products.stock` values |
| **From Phase 2** | Admin role authentication to protect dashboard routes |
| **npm Packages (Frontend Admin)** | `recharts` (charts), `lucide-react` (icons) |
| **API Endpoints Built** | `GET /api/stats` (revenue, order count), `GET /api/orders` (recent orders list), `POST /api/verify-exit` (QR validation) |
| **UI Screens Built** | Dashboard with stats & charts, Inventory table, Exit QR Verification (Admin) |

---

### Phase 7 — Polish, Testing & Demo Readiness
> **Depends on**: All previous phases (Phases 1–6) functional

| Category | What's Needed |
|:---------|:--------------|
| **From Phases 1–6** | All core features working end-to-end |
| **Testing** | Manual walkthrough of the full user journey: Register → Login → Select Store → Scan → Cart → Pay → Receipt → QR → Exit Verify |
| **Seed Data** | Expand to 15–20 realistic products across multiple categories |
| **Documentation** | `README.md` with install & run instructions |
| **Demo Script** | Step-by-step walkthrough document for live demonstrations |

---

### Dependency Chain (Visual)

```
Phase 1 (Foundation)
  └─→ Phase 2 (Auth)
        └─→ Phase 3 (Products)
              └─→ Phase 4 (Cart)
                    └─→ Phase 5 (Payment)
                          └─→ Phase 6 (Admin)
                                └─→ Phase 7 (Polish)
```

> Each phase builds strictly on the one before it. You cannot skip a phase without having its prerequisites in place.

---

## Phase 1 — Project Setup & Foundation

**Objective**: Establish the project structure, tooling, and database schema so all subsequent phases have a stable foundation to build on.

### 1.1 Repository & Project Initialization
| Task | Details |
|:-----|:--------|
| Create monorepo structure | `backend/`, `frontend-app/`, `frontend-admin/` |
| Backend scaffolding | Node.js + Express server with CORS and JSON middleware |
| Frontend App scaffolding | React (Vite) project configured for mobile-first UI |
| Frontend Admin scaffolding | React (Vite) project configured for desktop dashboard |

### 1.2 Database Setup
| Task | Details |
|:-----|:--------|
| Choose DB engine | **SQLite** for zero-config prototype (upgradeable to PostgreSQL later) |
| Create `products` table | `id` (barcode), `name`, `price`, `discountedPrice`, `weight`, `imageUrl`, `category`, `stock` |
| Create `users` table | `id`, `name`, `email`, `password` (hashed), `createdAt` |
| Create `orders` table | `id`, `userId`, `items` (JSON), `totalAmount`, `status`, `createdAt` |
| Seed sample data | Pre-populate 10–15 realistic supermarket products with barcodes |

### 1.3 API Gateway & Shared Config
| Task | Details |
|:-----|:--------|
| Define base API routes | `/api/auth`, `/api/products`, `/api/cart`, `/api/orders`, `/api/admin` |
| Environment configuration | `.env` file for `PORT`, `DB_PATH`, `JWT_SECRET` |
| Error handling middleware | Centralized error handler with consistent JSON error responses |

**Deliverable**: All three projects start and connect. Backend serves a health-check endpoint. Database is seeded.

---

## Phase 2 — Authentication & User Management

**Objective**: Allow customers and admin users to register, log in, and maintain authenticated sessions.

### 2.1 Backend — Authentication Service
| Task | Details |
|:-----|:--------|
| `POST /api/auth/register` | Accept `name`, `email`, `password`. Hash password and store in `users` table. |
| `POST /api/auth/login` | Validate credentials, return a JWT access token. |
| Auth middleware | Protect routes by verifying JWT from `Authorization` header. |
| Role-based access | Distinguish between `customer` and `admin` roles using a `role` field. |

### 2.2 Frontend App — Login & Registration Screens
| Task | Details |
|:-----|:--------|
| Splash screen | App branding with animated logo. |
| Login screen | Email + Password form with validation. |
| Registration screen | Name + Email + Password form. |
| Session persistence | Store JWT in `localStorage`; auto-redirect if already logged in. |

### 2.3 Frontend Admin — Admin Login
| Task | Details |
|:-----|:--------|
| Admin login screen | Email + Password form restricted to `admin` role. |
| Protected dashboard | Redirect unauthenticated users to login. |

**Deliverable**: Users can register, log in, and access role-appropriate views. Unauthenticated access is blocked.

---

## Phase 3 — Product Catalog & Store Selection

**Objective**: Enable the app to fetch and display product information from the backend using barcode lookups, and let customers select a store to begin shopping.

### 3.1 Backend — Product Catalog Service
| Task | Details |
|:-----|:--------|
| `GET /api/products/:barcode` | Look up a product by its barcode ID. Return product details (name, price, image, weight). |
| `GET /api/products` | List all products (for admin dashboard and browsing). |
| `GET /api/products?category=X` | Filter products by category. |
| Caching (optional) | In-memory cache for frequently scanned barcodes to improve lookup speed. |

### 3.2 Frontend App — Store Selection & Home
| Task | Details |
|:-----|:--------|
| Store selection screen | List of available stores (hardcoded for MVP). Selecting a store starts a shopping session. |
| Home / Start Shopping screen | Welcome banner, quick-scan button, and session status indicator. |

### 3.3 Frontend Admin — Product Management
| Task | Details |
|:-----|:--------|
| Product list view | Table of all products with barcode, name, category, price, stock. |
| Add / Edit product | Form to create or update product entries. |
| Delete product | Remove a product from the catalog. |

**Deliverable**: Scanning a barcode returns real product data. Admin can manage the product catalog.

---

## Phase 4 — Barcode Scanning & Smart Cart

**Objective**: Implement the core Virtual POS experience — scanning items and managing a live shopping cart.

### 4.1 Backend — Shopping Cart Service
| Task | Details |
|:-----|:--------|
| `POST /api/cart/add` | Add a scanned product to the user's active cart session. |
| `GET /api/cart` | Retrieve the current cart for the logged-in user. |
| `PUT /api/cart/update` | Update item quantity (increase / decrease). |
| `DELETE /api/cart/remove/:itemId` | Remove an item from the cart. |
| Cart totals | Calculate running subtotal, discount savings, and final total. |

### 4.2 Frontend App — Virtual POS Scanner & Cart
| Task | Details |
|:-----|:--------|
| Barcode Scanner screen | Text input for barcode entry (simulating camera scan for prototype). Camera integration can be added later using a library like `html5-qrcode`. |
| Product Details popup | After scan, display product name, image, price, and an "Add to Cart" confirmation. |
| Live Cart screen | List of cart items with quantity controls (+/−), item removal, and a live running total. |
| Undo last scan | Button to quickly remove the most recently added item. |

**Deliverable**: Users can scan barcodes, see product details, add items to cart, adjust quantities, and see a live total.

---

## Phase 5 — Checkout, Payment & Receipt

**Objective**: Complete the purchase flow with a payment step (mocked for MVP), generate a digital receipt, and produce an Exit QR code.

### 5.1 Backend — Order & Payment Service
| Task | Details |
|:-----|:--------|
| `POST /api/orders` | Create an order from the current cart. Calculate final bill. |
| Mock payment processing | Simulate payment success/failure (no real gateway for free prototype). Accept payment mode (UPI, Card, Wallet) as metadata. |
| `POST /api/orders/:id/pay` | Mark order as `PAID`. Trigger inventory deduction and receipt generation. |
| Digital receipt generation | Return a structured receipt object: order ID, itemized list, totals, timestamp. |
| Exit QR code generation | Generate a unique QR code string (`QR-<orderId>`) tied to the paid order. |

### 5.2 Backend — Inventory Service
| Task | Details |
|:-----|:--------|
| Stock deduction | On payment confirmation, reduce `stock` for each purchased product. |
| `GET /api/inventory` | Return current stock levels for all products (admin use). |
| Low-stock alerts | Flag products where `stock < threshold` in API responses. |

### 5.3 Frontend App — Payment & Receipt Screens
| Task | Details |
|:-----|:--------|
| Review Cart & Checkout | "Review & Pay" screen showing the final itemized bill. |
| Payment screen | Simulated payment options (UPI / Card / Wallet buttons). Mock payment confirmation. |
| Payment Success screen | Green checkmark animation, order ID, and total amount. |
| Digital Receipt screen | Itemized receipt with store name, date, items, quantities, prices, and total. |
| Exit QR Code screen | Large, scannable QR code display with instructions to show at exit. |

**Deliverable**: Complete end-to-end purchase flow from cart → payment → receipt → QR code. Inventory updates in real time.

---

## Phase 6 — Admin Dashboard & Exit Verification

**Objective**: Give store managers operational visibility and equip staff with a tool to verify customer exits.

### 6.1 Frontend Admin — Dashboard Analytics
| Task | Details |
|:-----|:--------|
| Stats overview cards | Total Revenue, Total Orders, Active Sessions, Low-Stock Items. |
| Sales chart | Line/bar chart of recent sales using Recharts. |
| Recent orders table | List of recent transactions with status badges. |

### 6.2 Frontend Admin — Inventory Management
| Task | Details |
|:-----|:--------|
| Inventory table | All products with current stock levels. Color-coded badges (green = good, red = low). |
| Stock update | Inline edit to manually adjust stock counts. |

### 6.3 Exit Verification (Staff View)
| Task | Details |
|:-----|:--------|
| QR Code scanner input | Text input to enter or scan the customer's Exit QR code. |
| `POST /api/verify-exit` | Backend endpoint that validates the QR code against paid orders. |
| Verification result screen | Green "Verified ✓" or Red "Not Verified ✗" with order details. |
| Manual approval button | Staff can manually approve in edge cases (MVP fallback). |

**Deliverable**: Admins can monitor sales and inventory. Staff can verify customer exits using QR codes.

---

## Phase 7 — Polish, Testing & Demo Readiness

**Objective**: Refine the UI, fix edge cases, and prepare the prototype for demonstration.

### 7.1 UI/UX Polish
| Task | Details |
|:-----|:--------|
| Consistent design system | Uniform colors, typography, spacing across all screens. |
| Loading states & skeletons | Smooth loading indicators for API calls. |
| Empty states | Friendly messages for empty cart, no orders, etc. |
| Micro-animations | Transitions for screen navigation, cart updates, payment success. |
| Responsive testing | Ensure the app UI works on various mobile screen sizes. |

### 7.2 Error Handling & Edge Cases
| Task | Details |
|:-----|:--------|
| Invalid barcode handling | Graceful "Product not found" message. |
| Duplicate scan handling | Increment quantity instead of adding duplicate entries. |
| Out-of-stock prevention | Block adding items with zero stock. |
| Session timeout | Handle expired JWT tokens gracefully. |

### 7.3 Demo Preparation
| Task | Details |
|:-----|:--------|
| Seed realistic demo data | 15–20 products across categories (Groceries, Snacks, Beverages, Personal Care). |
| Purchase history screen | Show past orders for the logged-in customer. |
| README with setup instructions | Document how to install, run, and demo the full prototype. |
| End-to-end walkthrough script | Step-by-step demo script showcasing the complete user journey. |

**Deliverable**: A polished, demo-ready prototype that tells the complete Eazy Shop story from entry to exit.

---

## Summary Timeline

| Phase | Focus | Key Output |
|:------|:------|:-----------|
| **Phase 1** | Setup & Foundation | Running projects, seeded DB, API skeleton |
| **Phase 2** | Authentication | Login/Register for customers and admins |
| **Phase 3** | Product Catalog | Barcode lookup, product management |
| **Phase 4** | Scanner & Cart | Virtual POS scanning, live cart |
| **Phase 5** | Checkout & Payment | Mock payment, receipt, Exit QR |
| **Phase 6** | Admin & Verification | Dashboard analytics, exit QR verification |
| **Phase 7** | Polish & Demo | UI refinement, testing, demo readiness |
| **Phase 8** | Deployment Strategy | Migration to Supabase, Vercel (Frontends), Render (Backend) |

---

## Phase 8 — Deployment Strategy (Production Readiness)

**Objective**: Move the application from a local development environment to a live internet-accessible environment using free-tier cloud providers.

### 8.1 Backend Migration & Deployment (Supabase + Render)
| Task | Details |
|:-----|:--------|
| Supabase Setup | Create a Supabase project and obtain the PostgreSQL `DATABASE_URL`. |
| Database Migration | Rewrite `backend/database.js` to replace `sqlite3` with `pg` (or an ORM) to connect to Supabase. |
| Table Creation | Execute SQL scripts to create `users`, `products`, `orders`, and `cart_items` tables in Supabase. |
| Environment Variables | Configure `DATABASE_URL`, `JWT_SECRET`, and `GROQ_API_KEY` on the Render dashboard. |
| Render Deployment | Connect the GitHub repository to Render as a Web Service (Root Dir: `backend`) and deploy. |
| CORS Configuration | Update `app.use(cors())` in `server.js` to explicitly allow traffic from the Vercel frontend domains. |

### 8.2 Frontend Deployment (Vercel)
| Task | Details |
|:-----|:--------|
| Environment Setup | Add `VITE_API_URL` to the frontend code to dynamically point to the live Render backend URL instead of `localhost:3000`. |
| Customer App Deployment | Connect GitHub repository to Vercel (Root Dir: `frontend-app`). Configure `VITE_API_URL` in Vercel settings and deploy. |
| Admin App Deployment | Connect GitHub repository to Vercel (Root Dir: `frontend-admin`). Configure `VITE_API_URL` in Vercel settings and deploy. |
| DNS / Domain Linking | (Optional) Link custom domains (e.g., `admin.eazyshop.com`, `app.eazyshop.com`) in Vercel. |

**Deliverable**: A live, scalable, full-stack application accessible by anyone on the internet, backed by a production-grade PostgreSQL database.

---

## Tech Stack (Free Prototype)

| Layer | Technology | Rationale |
|:------|:-----------|:----------|
| Backend | Node.js + Express | Lightweight, fast to develop, large ecosystem |
| Database | SQLite | Zero configuration, file-based, no server needed |
| Frontend App | React (Vite) | Fast build tooling, component-based UI |
| Frontend Admin | React (Vite) | Same stack for consistency |
| Icons | Lucide React | Lightweight, modern icon library |
| Charts | Recharts | Simple charting for admin analytics |
| Auth | JWT (jsonwebtoken) | Stateless, easy to implement |
