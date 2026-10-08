# ARGUS API Testing Documentation

This document provides a comprehensive guide for testing all API endpoints in the ARGUS Portal Backend.

---

## Base URL & Environment

- **Base URL:** `http://localhost:5000`
- **Content-Type:** `application/json`
- **Authentication Method:** HTTP-only Cookie (`jwt`). Upon calling `POST /api/auth/login`, the cookie is automatically set by the server and included in subsequent requests by tools like Postman, Thunder Client, or web browsers.

---

## Table of Endpoints

| Resource | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **System** | `GET` | `/api/health` | Public | Backend health check |
| **Auth** | `POST` | `/api/auth/register` | Public | Register a new user |
| **Auth** | `POST` | `/api/auth/login` | Public | Login & receive auth cookie |
| **Auth** | `POST` | `/api/auth/logout` | Public | Clear auth cookie |
| **Items** | `GET` | `/api/items` | Public | View active items (supports query filters) |
| **Items** | `POST` | `/api/items` | Private | Create a lost or found item |
| **Items** | `PUT` | `/api/items/:id` | Private (Owner) | Update an owned item |
| **Items** | `DELETE` | `/api/items/:id` | Private (Owner) | Delete an owned item |
| **Claims** | `POST` | `/api/claims` | Private | Submit a claim on an item |
| **Claims** | `GET` | `/api/claims` | Private | View claims received on user's items |
| **Claims** | `PUT` | `/api/claims/:id` | Private (Owner) | Approve or reject a claim |

---

## 1. System Endpoints

### 1.1 Health Check
Verify that the backend server is running and accessible.

- **Method:** `GET`
- **Endpoint:** `/api/health`
- **Authentication:** None (Public)
- **Expected Status:** `200 OK`
- **Example Response:**
```json
{
  "message": "ARGUS Backend is running"
}
```

---

## 2. Authentication Endpoints (`/api/auth`)

### 2.1 Register User
Creates a new user account with hashed password storage.

- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Authentication:** None (Public)
- **Required Body Fields:**
  - `name` (String, required)
  - `email` (String, valid email format)
  - `password` (String, minimum 6 characters)
- **Example Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@university.edu",
  "password": "Password123"
}
```
- **Expected Status:** `201 Created`
- **Example Response:**
```json
{
  "_id": "67041a9e8f1c2b3d4e5f6a71",
  "name": "Jane Doe",
  "email": "jane@university.edu",
  "createdAt": "2026-10-08T03:45:00.000Z"
}
```

---

### 2.2 Login User
Authenticates user credentials and sets an HTTP-only JWT cookie.

- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Authentication:** None (Public)
- **Required Body Fields:**
  - `email` (String, required)
  - `password` (String, required)
- **Example Request Body:**
```json
{
  "email": "jane@university.edu",
  "password": "Password123"
}
```
- **Expected Status:** `200 OK`
- **Cookie Set:** `jwt=<token>; HttpOnly; SameSite=Strict; Max-Age=2592000`
- **Example Response:**
```json
{
  "_id": "67041a9e8f1c2b3d4e5f6a71",
  "name": "Jane Doe",
  "email": "jane@university.edu",
  "createdAt": "2026-10-08T03:45:00.000Z"
}
```

---

### 2.3 Logout User
Clears the HTTP-only authentication cookie.

- **Method:** `POST`
- **Endpoint:** `/api/auth/logout`
- **Authentication:** None (Public)
- **Expected Status:** `200 OK`
- **Example Response:**
```json
{
  "message": "User logged out successfully"
}
```

---

## 3. Item Endpoints (`/api/items`)

### 3.1 Get All Active Items
Retrieves all active lost and found items. Supports optional query filtering.

- **Method:** `GET`
- **Endpoint:** `/api/items`
- **Authentication:** None (Public)
- **Optional Query Parameters:**
  - `type` (`LOST` or `FOUND`) &rarr; `/api/items?type=LOST`
  - `category` (e.g. `Electronics`, `Documents`) &rarr; `/api/items?category=Electronics`
  - Combined &rarr; `/api/items?type=FOUND&category=Electronics`
- **Expected Status:** `200 OK`
- **Example Response:**
```json
[
  {
    "_id": "67042c1b8f1c2b3d4e5f6a72",
    "title": "Black HP Laptop Charger",
    "description": "Found near Library 2nd floor desk 14",
    "category": "Electronics",
    "type": "FOUND",
    "location": "Library 2nd Floor",
    "date": "2026-10-07T09:00:00.000Z",
    "imageUrl": "https://example.com/charger.jpg",
    "contactInformation": "jane@university.edu",
    "secretQuestion": "What is the wattage written on the back label?",
    "secretAnswer": "65W",
    "submitterId": {
      "_id": "67041a9e8f1c2b3d4e5f6a71",
      "name": "Jane Doe",
      "email": "jane@university.edu",
      "profileImage": ""
    },
    "status": "ACTIVE",
    "createdAt": "2026-10-08T04:00:00.000Z",
    "updatedAt": "2026-10-08T04:00:00.000Z"
  }
]
```

---

### 3.2 Create Item
Posts a new lost or found item. The logged-in user is automatically linked as `submitterId`.

- **Method:** `POST`
- **Endpoint:** `/api/items`
- **Authentication:** Required (Logged-in user)
- **Required Body Fields:**
  - `title` (String)
  - `description` (String)
  - `category` (String)
  - `type` (`LOST` or `FOUND`)
  - `location` (String)
  - `date` (Date / ISO string)
  - `contactInformation` (String)
- **Optional Body Fields:**
  - `imageUrl` (String)
  - `secretQuestion` (String)
  - `secretAnswer` (String)
- **Example Request Body:**
```json
{
  "title": "Blue Water Bottle",
  "description": "Hydro Flask left in Seminar Hall A",
  "category": "Personal Accessories",
  "type": "FOUND",
  "location": "Seminar Hall A",
  "date": "2026-10-08T10:00:00.000Z",
  "imageUrl": "",
  "contactInformation": "Campus Security Ext. 104",
  "secretQuestion": "What sticker is on the bottle lid?",
  "secretAnswer": "NASA sticker"
}
```
- **Expected Status:** `201 Created`
- **Example Response:**
```json
{
  "_id": "6704300a8f1c2b3d4e5f6a73",
  "title": "Blue Water Bottle",
  "description": "Hydro Flask left in Seminar Hall A",
  "category": "Personal Accessories",
  "type": "FOUND",
  "location": "Seminar Hall A",
  "date": "2026-10-08T10:00:00.000Z",
  "imageUrl": "",
  "contactInformation": "Campus Security Ext. 104",
  "secretQuestion": "What sticker is on the bottle lid?",
  "secretAnswer": "NASA sticker",
  "submitterId": "67041a9e8f1c2b3d4e5f6a71",
  "status": "ACTIVE",
  "createdAt": "2026-10-08T04:30:00.000Z",
  "updatedAt": "2026-10-08T04:30:00.000Z"
}
```

---

### 3.3 Update Item
Updates an existing item. Only the user who originally submitted the item can update it.

- **Method:** `PUT`
- **Endpoint:** `/api/items/:id`
- **Authentication:** Required (Item Submitter only)
- **Updatable Body Fields:**
  - `title`, `description`, `category`, `location`, `imageUrl`, `status` (`ACTIVE`, `CLAIMED`, `CLOSED`)
- **Example Request Body:**
```json
{
  "location": "Main Security Office (Lost & Found Locker #4)",
  "status": "ACTIVE"
}
```
- **Expected Status:** `200 OK`
- **Error Status:** `403 Forbidden` if attempted by a different user.
- **Example Response:**
```json
{
  "_id": "6704300a8f1c2b3d4e5f6a73",
  "title": "Blue Water Bottle",
  "location": "Main Security Office (Lost & Found Locker #4)",
  "status": "ACTIVE",
  "updatedAt": "2026-10-08T04:45:00.000Z"
}
```

---

### 3.4 Delete Item
Removes an item from the database. Only the item submitter can delete it.

- **Method:** `DELETE`
- **Endpoint:** `/api/items/:id`
- **Authentication:** Required (Item Submitter only)
- **Expected Status:** `200 OK`
- **Error Status:** `403 Forbidden` if attempted by a different user.
- **Example Response:**
```json
{
  "message": "Item deleted successfully",
  "id": "6704300a8f1c2b3d4e5f6a73"
}
```

---

## 4. Claim Endpoints (`/api/claims`)

### 4.1 Submit a Claim
Allows an authenticated user to submit a claim request on a lost/found item.

- **Method:** `POST`
- **Endpoint:** `/api/claims`
- **Authentication:** Required (Logged-in user)
- **Required Body Fields:**
  - `itemId` (String, valid MongoDB ObjectId)
  - `message` (String, explanation of ownership)
- **Optional Body Fields:**
  - `providedAnswer` (String, answer to the item's security question)
- **Example Request Body:**
```json
{
  "itemId": "67042c1b8f1c2b3d4e5f6a72",
  "message": "I lost this laptop charger yesterday afternoon during study group.",
  "providedAnswer": "65W"
}
```
- **Expected Status:** `201 Created`
- **Example Response:**
```json
{
  "_id": "6704400c8f1c2b3d4e5f6a74",
  "itemId": "67042c1b8f1c2b3d4e5f6a72",
  "requesterId": "67041a9e8f1c2b3d4e5f6a71",
  "message": "I lost this laptop charger yesterday afternoon during study group.",
  "providedAnswer": "65W",
  "status": "PENDING",
  "createdAt": "2026-10-08T05:00:00.000Z",
  "updatedAt": "2026-10-08T05:00:00.000Z"
}
```

---

### 4.2 Get Received Claims
Retrieves all claim requests submitted for items posted by the logged-in user.

- **Method:** `GET`
- **Endpoint:** `/api/claims`
- **Authentication:** Required (Item submitter)
- **Expected Status:** `200 OK`
- **Example Response:**
```json
[
  {
    "_id": "6704400c8f1c2b3d4e5f6a74",
    "itemId": {
      "_id": "67042c1b8f1c2b3d4e5f6a72",
      "title": "Black HP Laptop Charger",
      "category": "Electronics",
      "type": "FOUND",
      "status": "ACTIVE"
    },
    "requesterId": {
      "_id": "67041a9e8f1c2b3d4e5f6a71",
      "name": "Jane Doe",
      "email": "jane@university.edu"
    },
    "message": "I lost this laptop charger yesterday afternoon during study group.",
    "providedAnswer": "65W",
    "status": "PENDING",
    "createdAt": "2026-10-08T05:00:00.000Z"
  }
]
```

---

### 4.3 Approve or Reject Claim
Allows the item owner to approve or reject a claim. 

> **Important Workflow**: When a claim is approved:
> 1. The target claim status changes to `APPROVED`.
> 2. The related item status changes to `CLAIMED`.
> 3. All other competing pending claims for that same item are automatically set to `REJECTED`.

- **Method:** `PUT`
- **Endpoint:** `/api/claims/:id`
- **Authentication:** Required (Item Submitter only)
- **Required Body Fields:**
  - `status` (`APPROVED` or `REJECTED`)
- **Example Request Body (Approval):**
```json
{
  "status": "APPROVED"
}
```
- **Expected Status:** `200 OK`
- **Example Response:**
```json
{
  "_id": "6704400c8f1c2b3d4e5f6a74",
  "itemId": "67042c1b8f1c2b3d4e5f6a72",
  "requesterId": "67041a9e8f1c2b3d4e5f6a71",
  "status": "APPROVED",
  "updatedAt": "2026-10-08T05:15:00.000Z"
}
```

---

## 5. Testing Flow Summary (Step-by-Step)

To test the entire ARGUS backend end-to-end:

1. **Register User A (Finder):** `POST /api/auth/register`
2. **Login User A:** `POST /api/auth/login` (receives auth cookie)
3. **User A Posts Found Item:** `POST /api/items` (creates Item in `ACTIVE` state)
4. **Register & Login User B (Claimant):** `POST /api/auth/register` & `login`
5. **User B Views Items:** `GET /api/items`
6. **User B Submits Claim:** `POST /api/claims` with User A's `itemId`
7. **User A Logs back in & Views Claims:** `GET /api/claims`
8. **User A Approves Claim:** `PUT /api/claims/:id` with `status: "APPROVED"`
9. **Verify Public Listings:** `GET /api/items` (item is now hidden from active list because status is `CLAIMED`).
