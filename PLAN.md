# Restaurant POS System - Master Implementation Plan

A portfolio-grade, production-ready, decoupled Restaurant Point of Sale (POS) application built with clean architecture, separation of concerns, and robust transactional integrity.

---

## 🏛 Architecture Overview

The system follows a **Decoupled Client-Server Architecture**:

```
adisyonSistemi/
├── backend/                       # REST API (Express.js + TypeScript + Prisma ORM)
│   ├── prisma/
│   │   ├── schema.prisma         # PostgreSQL Schema & Indexes
│   │   └── seed.ts               # Database Seed with initial menu & tables
│   ├── src/
│   │   ├── config/               # Environment & database clients
│   │   ├── controllers/          # HTTP request handlers
│   │   ├── services/             # Business logic & atomic transactions
│   │   ├── repositories/         # Prisma query abstraction
│   │   ├── routes/               # API endpoint definitions
│   │   ├── middlewares/          # Validation, error handling, logging
│   │   ├── schemas/              # Zod input validation schemas
│   │   └── types/                # Domain & DTO TypeScript interfaces
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/                      # Single Page Application (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Buttons, modals, badge, toasts
│   │   │   ├── layout/           # Header, table selector, grid layout
│   │   │   ├── menu/             # Categories, product cards, filters
│   │   │   └── cart/             # Order items, quantity controls, totals, checkout
│   │   ├── stores/               # Zustand state stores (table, cart, menu)
│   │   ├── services/             # Axios/fetch API clients
│   │   ├── types/                # Frontend mirrored types
│   │   └── utils/                # Currency formatters, calculations
│   ├── tailwind.config.js
│   ├── package.json
│   └── tsconfig.json
├── PLAN.md                        # Master Implementation Roadmap
└── README.md                      # Project setup & documentation
```

---

## 📋 Logical Phases Roadmap

### 🔹 Phase 1: Database Setup, Schema Design & Core Domain Types
- [x] Initialize decoupled structure (`backend/` & `frontend/`).
- [x] Setup Node.js + TypeScript + Prisma in `backend/`.
- [x] Define PostgreSQL schema in `prisma/schema.prisma`:
  - `Table`: `id`, `tableNumber`, `status` (`AVAILABLE`, `OCCUPIED`).
  - `Category`: `id`, `name`, `createdAt`, `updatedAt`.
  - `Product`: `id`, `categoryId`, `name`, `price`, `isActive` (boolean soft-delete flag).
  - `Order`: `id`, `tableId`, `status` (`OPEN`, `PAID`, `CANCELLED`), `totalAmount`, `createdAt`.
  - `OrderItem`: `id`, `orderId`, `productId`, `quantity`, `unitPrice` (price snapshot at ordering time), `subTotal`.
- [x] Implement seed script (`prisma/seed.ts`) with tables, categories, and initial catalog.
- [x] Define shared TypeScript domain interfaces and DTOs.
- [x] Verify Prisma schema generation & validate migrations.
- [x] **Deliverable**: Phase 1 summary & Git commit message. **Wait for user approval**.

---

### 🔹 Phase 2: Core Backend REST API & Atomic Transactions
- [x] Build Express application with layered architecture (Routes -> Controllers -> Services -> Repositories).
- [x] Global error-handling middleware and standard JSON response formatter (`{ success, data, error }`).
- [x] Zod request validation middleware.
- [x] **Table Management API**:
  - `GET /api/tables` (list all tables with active order info).
  - `GET /api/tables/:id` (table detail).
  - `PATCH /api/tables/:id/status` (manually change status if needed).
- [x] **Catalog API**:
  - `GET /api/categories` (list all categories).
  - `GET /api/products` (filter by category, active-only soft-delete filter).
  - `POST /api/products` / `PATCH /api/products/:id` (product management with soft delete).
- [x] **Order & Cart API**:
  - `GET /api/orders/active/:tableId` (retrieve active open order for a table).
  - `POST /api/orders` (open new order for table or add items).
  - `PATCH /api/orders/:orderId/items` (update quantities, remove items, recalculate totals).
  - `POST /api/orders/:orderId/checkout`:
    - **Atomic Transaction** via `prisma.$transaction`:
      1. Update `Order.status = 'PAID'`.
      2. Update `Table.status = 'AVAILABLE'`.
      3. Guaranteed rollback if either step fails.
  - `POST /api/orders/:orderId/cancel` (cancel open order and release table).
- [x] API integration tests / manual endpoint verification.
- [x] **Deliverable**: Phase 2 summary & Git commit message. **Wait for user approval**.

---

### 🔹 Phase 3: Frontend POS Client (React + TypeScript + Tailwind CSS)
- [ ] Initialize Vite + React (TypeScript) + Tailwind CSS + Lucide Icons.
- [ ] Setup Zustand store for:
  - `useTableStore`: Active selected table, table statuses.
  - `useMenuStore`: Categories, active category filter, products catalog.
  - `useOrderStore`: Current order items, subtotal calculation, checkout loading state.
- [ ] **UI Layout & Components**:
  - **Top Navigation Bar**: Brand logo, active table switcher, table status badges (`Available` / `Occupied`).
  - **Left Panel (Menu Area)**:
    - Horizontal category filter pills (All, Burgers, Pizzas, Drinks, Desserts, Starters).
    - Responsive product cards displaying name, price, badge.
    - Click-to-add micro-animation.
  - **Right Panel (Order / Cart Area)**:
    - Table indicator (`Table #X - Active Order`).
    - Itemized order list: item name, unit price, quantity increment (`+`) and decrement (`-`), remove item button.
    - Financial summary: Subtotal, VAT / Service fee, dynamic Grand Total.
    - "Pay & Checkout" button with clear state feedback.
- [ ] High-end, responsive POS aesthetics (vibrant accents, dark/light contrast, polished micro-interactions).
- [ ] **Deliverable**: Phase 3 summary & Git commit message. **Wait for user approval**.

---

### 🔹 Phase 4: Full-Stack Integration, Live State Sync & Testing
- [ ] Connect Frontend Zustand stores to Backend API endpoints.
- [ ] Implement error notifications and feedback toasts.
- [ ] End-to-end verification:
  1. Select Table 2.
  2. Add items to order -> Table becomes `OCCUPIED`.
  3. Modify item quantities -> Grand total recalculates correctly.
  4. Perform Checkout -> Transaction commits -> Order marked `PAID`, Table reset to `AVAILABLE`.
- [ ] Docker configuration (`docker-compose.yml` for PostgreSQL) for seamless local setup.
- [ ] Comprehensive `README.md` with setup guide, API docs, and architecture walkthrough.
- [ ] **Deliverable**: Final summary & Git commit message.

---

## 🔒 Critical Technical Requirements Matrix

| Requirement | Implementation Strategy |
| :--- | :--- |
| **Decoupled Architecture** | Independent `backend/` and `frontend/` services with clear API contracts |
| **Language Consistency** | 100% English for code, variables, DB schemas, API endpoints, commit messages |
| **Soft Delete** | Products have `isActive: Boolean`. Never hard deleted to preserve historical data |
| **Price Snapshot** | `OrderItem.unitPrice` copies product price at order creation time |
| **Atomic Checkout** | Handled in `prisma.$transaction` across `Order` status update and `Table` status update |
| **Input Validation** | Strict Zod schemas on all API boundaries with type inference |
| **State Management** | Zustand stores with optimistic UI updates and reactive totals |
