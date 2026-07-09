# Staff Management — PHP Build

## Project Overview

A full-stack staff management application for managing staff, events, teams, and roles within an organization. Dual-role access: **Super Admin** (oversees everything) and **Admin** (manages their own events/staff/teams). Originally built with Nuxt 3, migrated to procedural PHP + vanilla JS SPA.

---

## Architecture

```
stm_php/
├── backend/                 # PHP REST API (procedural)
│   ├── api/index.php        # Router — parses URI, dispatches to handlers
│   ├── api/{auth,admins,staff,events,roles,teams,dashboard,export}/
│   ├── config/database.php  # PDO/SQLite connection, schema init, seed
│   ├── utils/{jwt,response,cors}.php
│   └── middleware/auth.php  # requireAuth(), requireSuperAdmin()
├── frontend/                # Vanilla JS SPA (no framework)
│   ├── css/style.css
│   └── js/{api,router,auth,app}.js + pages/*.js
├── index.html               # SPA entry point
├── sw.js                    # Service Worker
├── manifest.json            # PWA manifest
├── dev-server.php           # PHP built-in server router
└── AGENTS.md
```

### Data flow
```
Browser → index.html → frontend/js/*.js → fetch(/api/...) → PHP router → handler → SQLite → JSON → render
```

---

## Database Schema (SQLite)

### admins
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK AUTOINCREMENT | |
| fullname | TEXT NOT NULL | |
| username | TEXT UNIQUE NOT NULL | |
| email | TEXT nullable | |
| phone | TEXT nullable | |
| password | TEXT NOT NULL | bcrypt hash |
| department | TEXT nullable | |
| status | TEXT DEFAULT 'active' | 'active' or 'inactive' |
| role | TEXT DEFAULT 'admin' | 'admin' or 'super_admin' |
| created_at / updated_at | DATETIME | auto |

### staff
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK AUTOINCREMENT | |
| staff_id | TEXT UNIQUE | auto-generated STF-{timestamp} |
| firstname / lastname | TEXT NOT NULL | |
| phone / email / address / gender | TEXT nullable | NULL when empty |
| status | TEXT DEFAULT 'active' | |
| admin_id | INTEGER → admins(id) | owner |
| created_at / updated_at | DATETIME | auto |

### events
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK AUTOINCREMENT | |
| event_name | TEXT NOT NULL | |
| description / venue | TEXT nullable | |
| event_date | DATE | |
| start_time / end_time | TEXT | |
| status | TEXT DEFAULT 'active' | 'active' or 'archived' |
| admin_id | INTEGER → admins(id) | creator |
| created_at / updated_at | DATETIME | auto |

### roles
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK AUTOINCREMENT | |
| name | TEXT UNIQUE NOT NULL | |
| description | TEXT nullable | |
| created_at | DATETIME | auto |

### teams
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK AUTOINCREMENT | |
| team_name | TEXT NOT NULL | |
| event_id | INTEGER → events(id) ON DELETE CASCADE | |
| admin_id | INTEGER → admins(id) | owner |
| created_at | DATETIME | auto |

### Junction tables: staff_roles, team_members, event_staff
Each has `(id PK, fk1, fk2, UNIQUE(fk1, fk2))`.

---

## API Endpoints

All endpoints require `Authorization: Bearer {token}` except `/api/auth/login`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | None | Login, returns JWT + user |
| GET | /api/auth/me | Any | Current user profile |
| GET | /api/admins | super_admin | List admins, `?search=` |
| POST | /api/admins | super_admin | Create admin |
| PUT | /api/admins/:id | super_admin | Update admin |
| DELETE | /api/admins/:id | super_admin | Delete admin (cannot self-delete) |
| GET | /api/staff | Any | List staff, `?search=&role_id=&event_id=` |
| POST | /api/staff | Any | Create staff |
| GET | /api/staff/:id | Any | Single staff with roles + teams |
| PUT | /api/staff/:id | Any | Update staff fields |
| DELETE | /api/staff/:id | Any | Delete staff (cascade junction tables) |
| POST | /api/staff/:id/roles | Any | Assign roles to staff |
| DELETE | /api/staff/:id/roles/:rid | Any | Remove role from staff |
| GET | /api/events | Any | List events, `?search=` |
| POST | /api/events | super_admin | Create event |
| PUT | /api/events/:id | super_admin | Update event |
| DELETE | /api/events/:id | super_admin | Delete event |
| POST | /api/events/:id/staff | Any | Assign staff to event |
| GET | /api/roles | Any | List roles with staff_count |
| POST | /api/roles | Any | Create role (name unique) |
| PUT | /api/roles/:id | Any | Update role |
| DELETE | /api/roles/:id | Any | Delete role |
| GET | /api/teams | Any | List teams, `?event_id=` |
| POST | /api/teams | Any | Create team |
| PUT | /api/teams/:id | Any | Update team (owner check) |
| DELETE | /api/teams/:id | Any | Delete team (owner check) |
| GET | /api/teams/:id/members | Any | List team members with roles |
| POST | /api/teams/:id/members | Any | Add members |
| DELETE | /api/teams/:id/members/:mid | Any | Remove member |
| GET | /api/dashboard/super-admin | super_admin | Stats + charts + recent admins |
| GET | /api/dashboard/admin | Any | Stats + upcoming events + recent teams/staff |
| GET | /api/export/admins?format=csv | super_admin | Export admins CSV |
| GET | /api/export/teams?format=csv | Any | Export all teams + members CSV |
| GET | /api/export/teams/:id?format=csv | Any | Export single team members CSV |

### Scoping rules
- **Admin** sees only their own staff (`admin_id` or staff in their events via `event_staff`), events, and teams.
- **Super admin** sees everything across all admins.
- **Roles** are global (same across all admins).
- Event **create/update/delete** are super_admin-only.

---

## Frontend Patterns

### SPA via hash routing
All routes are hash-based (`#/admin/dashboard`). Router in `frontend/js/router.js`.

### File structure
```
frontend/js/
├── api.js         # fetch wrapper: apiGet, apiPost, apiPut, apiDelete
├── auth.js        # Auth singleton: login, logout, init, state (user + token)
├── router.js      # Router: register, navigate, handleRoute, init
├── app.js         # renderSidebar, helpers (showLoading, escapeHtml, etc.), registerRoutes, init
└── pages/
    ├── login.js
    ├── admin/{dashboard,events,staff,roles,teams}.js
    └── super-admin/{dashboard,admins,events,staff,roles}.js
```

### Page rendering pattern
Every page function:
1. Calls `showLoading()` to show spinner
2. Fetches data via `apiGet(...)`
3. Sets `document.getElementById('page-content').innerHTML = ...` with the rendered HTML
4. Catches errors with `showError(err.message)`

### CRUD modal pattern
- Each CRUD page has a `{page}Modal()` function returning HTML string
- `openModal(id)` / `closeModal(id)` toggle overlay
- A `{prefix}ResetForm()` function clears fields for "Add" mode
- A `{prefix}OpenEdit(id)` function fills form for "Edit" mode
- The form submit handler distinguishes create vs update by checking `document.getElementById('{prefix}_id').value`

### State
- Auth state in `Auth` object (JS module), persisted to `localStorage` (keys: `token`, `user`)
- Page data stored in module-level variables (e.g., `adminStaffData`, `adminRolesData`)

### Reusable helpers (in app.js)
- `showLoading()` — spinner in `#page-content`
- `showError(msg)` — error alert in `#page-content`
- `escapeHtml(str)` — XSS-safe output
- `getStatusBadge(status)` — active/inactive badge HTML
- `openModal(id)` / `closeModal(id)` — modal overlay control

---

## Backend Patterns (PHP Procedural)

### Router (`backend/api/index.php`)
- Parses `$_SERVER['REQUEST_URI']` and `$_SERVER['REQUEST_METHOD']`
- Regex-matches URI patterns, extracts route params into `$GLOBALS['route_*']`
- Includes the appropriate handler file which reads route params from globals
- All handlers called via `require` — they execute and call `jsonResponse()` or `errorResponse()` which call `exit`

### Handler pattern
```php
<?php
$auth = requireAuth();            // or requireSuperAdmin()
$input = json_decode(file_get_contents('php://input'), true);
$db = getDb();
// ... query logic ...
jsonResponse($result);
```

### Authentication
- JWT with HMAC-SHA256 (manual implementation in `utils/jwt.php`)
- Secret: `staff-management-secret-key-2025`
- Expiry: 24 hours (86400 seconds)
- `requireAuth()` — returns decoded payload or 401
- `requireSuperAdmin()` — same + 403 if not super_admin

### Database
- SQLite via PDO (singleton in `getDb()`)
- Schema auto-created on first request via `initDatabase()`
- Default super_admin seeded via `seedDefaultAdmin()` (admin / 123456789)
- DB file: `data/staff_management.db`
- All queries use prepared statements with `?` placeholders

### Response helpers
- `jsonResponse(data, status)` — JSON response with status code
- `errorResponse(message, status)` — `{error: message}` JSON
- `successResponse(data, message)` — `{message, data}` JSON

### Authorization scoping (SQL pattern)
```php
if ($auth['role'] !== 'super_admin') {
    $conditions[] = "(s.admin_id = ? OR s.id IN (SELECT staff_id FROM event_staff es JOIN events e ON es.event_id = e.id WHERE e.admin_id = ?))";
}
```

---

## Coding Conventions

- **No classes, no OOP** — all procedural functions
- **No comments** in code unless explaining a non-obvious edge case
- **PHP**: type-strict where practical, `trim()` user input, store NULL for empty optional fields
- **JavaScript**: no framework, arrow functions `() => {}`, 2-space indent
- **CSS**: custom properties in `:root`, utility-first (no Tailwind), BEM-lite naming
- **Files**: lowercase with underscores (`assign_staff.php`), JS matches page name (`admin/staff.js`)

---

## How to Run

```bash
# Prerequisites
sudo apt install php-sqlite3

# Start dev server
php -S localhost:8000 stm_php/dev-server.php

# Login
# Username: admin
# Password: 123456789
```

---

## Default Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | 123456789 | super_admin |
