# Lost & Found Item Management System

A full-stack MERN (MongoDB, Express, React, Node.js) web application for managing lost and found items on a college campus.

## Project Structure

```
Mse2/
├── backend/          # Node.js + Express API
│   ├── models/       # MongoDB Schemas
│   ├── routes/       # API Routes
│   ├── middleware/   # JWT Auth Middleware
│   ├── .env          # Environment Variables
│   └── server.js     # Entry Point
└── frontend/         # React + Vite Frontend
    └── src/
        ├── pages/    # Register, Login, Dashboard
        ├── api.js    # Axios API client
        └── App.jsx   # Router
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas cloud)

### Step 1: Configure MongoDB

**Option A: MongoDB Atlas (Recommended - Free Cloud)**
1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free account and cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `MONGO_URI` in `backend/.env` with your string

**Option B: Local MongoDB**
1. Install MongoDB Community Edition
2. Start: `mongod --dbpath C:/data/db`
3. Set `MONGO_URI=mongodb://localhost:27017/lost_found_db`

### Step 2: Start Backend

```bash
cd backend
# Edit .env with your MONGO_URI first!
npm run dev
```

Backend runs on: http://localhost:5000

### Step 3: Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on: http://localhost:5173

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/register | No | Register user |
| POST | /api/login | No | Login user |
| GET | /api/items | Yes | Get all items |
| POST | /api/items | Yes | Add new item |
| GET | /api/items/:id | Yes | Get item by ID |
| PUT | /api/items/:id | Yes | Update item |
| DELETE | /api/items/:id | Yes | Delete item |
| GET | /api/items/search?name=xyz | Yes | Search items |

## Features

- ✅ JWT Authentication (Register/Login/Logout)
- ✅ Password hashing with bcrypt
- ✅ Protected routes
- ✅ Report Lost/Found items
- ✅ Search & filter items
- ✅ Edit/Delete own items
- ✅ Responsive dark theme UI
