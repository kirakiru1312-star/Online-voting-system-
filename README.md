# 🗳️ Online Voting System — Distributed Edition

A secure web-based Online Voting System built with React, Node.js, and MongoDB.
Upgraded to a **Distributed System** with multiple independent backend services and multiple databases.

---

## 🧠 What is a Distributed System? (Simple Explanation)

Imagine a **hospital** with different departments:

- The **Reception** handles patient registration
- The **Pharmacy** handles medicines
- The **Lab** handles test results

Each department works **independently** but they all serve the same hospital.

This project works the same way. Instead of one big backend doing everything, we split it into **3 separate services**, each with its **own database**.

---

## 🏗️ How the System is Divided

### Before (Monolithic — one big backend)
```
Frontend → backend/server.js (port 5000) → voting_system (one database)
```
Everything was in one place. If the vote system crashed, everything crashed.

### After (Distributed — 3 independent services)
```
Frontend → API Gateway (port 5000)
                ├── Auth Service    (port 5001) → db_auth
                ├── Election Service(port 5002) → db_election
                └── Voting Service  (port 5003) → db_voting
```
Each service runs independently. If one has a problem, the others keep working.

---

## 🔧 The 4 Components

### 1. 🔐 Auth Service — Port 5001 — Database: `db_auth`
**What it does:** Handles everything about users.

**Examples:**
- A voter registers → saved in `db_auth`
- A voter logs in → Auth Service checks the password
- Admin views voter list → Auth Service returns it

**Collections in `db_auth`:**
| Collection | What it stores |
|---|---|
| `users` | All registered voters and admins |
| `auditlogs` | Every action (login, vote, etc.) with timestamp |

---

### 2. 🗳️ Election Service — Port 5002 — Database: `db_election`
**What it does:** Handles elections, parties, candidates, and contact messages.

**Examples:**
- Admin creates a new election → saved in `db_election`
- Admin adds a political party with a logo → saved in `db_election`
- Voter views the list of parties → Election Service returns them
- Voter sends a contact message → saved in `db_election`

**Collections in `db_election`:**
| Collection | What it stores |
|---|---|
| `elections` | All elections (title, dates, status) |
| `parties` | Political parties with logos |
| `candidates` | Independent candidates |
| `contactmessages` | Messages sent by voters |

---

### 3. 📊 Voting Service — Port 5003 — Database: `db_voting`
**What it does:** Handles vote casting and results.

**Examples:**
- Voter clicks "Vote for Party X" → saved in `db_voting`
- System checks if voter already voted → checks `db_voting`
- Admin views vote tally → Voting Service counts from `db_voting`

**Collections in `db_voting`:**
| Collection | What it stores |
|---|---|
| `finalvotes` | Every vote cast (one per voter) |
| `votelogs` | Vote attempt history (success/rejected) |
| `partyvotes` | Party vote records |

---

### 4. 🌐 API Gateway — Port 5000
**What it does:** Acts as the **front door** for the entire system.

The frontend always talks to port 5000. The Gateway decides which service to forward the request to.

**Example:**
```
Voter logs in       → Gateway → Auth Service     (5001)
Voter views parties → Gateway → Election Service (5002)
Voter casts vote    → Gateway → Voting Service   (5003)
```

The frontend never needs to know about the 3 services. It only talks to the Gateway.

---

## 🗄️ The 4 Databases

| Database | Used By | Purpose |
|---|---|---|
| `voting_system` | Original backend | Original data (untouched) |
| `db_auth` | Auth Service | Users and audit logs |
| `db_election` | Election Service | Elections, parties, candidates |
| `db_voting` | Voting Service | Votes and results |

---

## 🔗 How Services Talk to Each Other

Services communicate using HTTP API calls. Example:

1. Voter casts a vote → **Voting Service** receives the request
2. Voting Service calls **Auth Service** → "Is this user real? Have they voted before?"
3. Auth Service replies → "Yes, real user. Not voted yet."
4. Voting Service saves the vote → marks user as voted in **Auth Service**
5. Done ✅

---

## ❓ Instructor Q&A — Distributed System Explanation

---

### 1️⃣ How Many Backends and Databases Are Used?

This system uses **4 backend services** and **4 databases** in total.

#### Backend Services:

| # | Service | Port | Responsibility |
|---|---|---|---|
| 1 | `backend/` (original) | 5000 | Original monolithic backend (kept for safety) |
| 2 | `auth-service/` | 5001 | User registration, login, JWT, audit logs |
| 3 | `election-service/` | 5002 | Elections, parties, candidates, contact |
| 4 | `voting-service/` | 5003 | Vote casting, results, vote logs |
| — | `gateway/` | 5000 | Routes requests to the correct service |

> **Simple example:** Think of 3 separate restaurants in one food court. Each restaurant (service) cooks its own food (handles its own data). The food court entrance (gateway) directs customers to the right restaurant.

#### Each backend runs on a different port:
- Port `5001` → only Auth Service runs here
- Port `5002` → only Election Service runs here
- Port `5003` → only Voting Service runs here

This means they are **completely independent** — stopping one does not stop the others.

---

#### ▶️ How to Start Each Backend Individually:

```bash
# Start only Auth Service
cd auth-service
npm start

# Start only Election Service
cd election-service
npm start

# Start only Voting Service
cd voting-service
npm start

# Start only API Gateway
cd gateway
npm start
```

#### ▶️ How to Start All Together (using batch file):

Simply **double-click** `start-all.bat` in the project root folder.
It opens 4 separate terminal windows automatically, one for each service.

Or from PowerShell:
```powershell
.\start-all.bat
```

---

#### 👁️ How to View Each Database:

**Using MongoDB Compass (visual tool):**
1. Open MongoDB Compass
2. Connect to: `mongodb://127.0.0.1:27017`
3. In the left sidebar you will see all databases:
```
db_auth        ← click to see: users, auditlogs
db_election    ← click to see: elections, parties, candidates
db_voting      ← click to see: finalvotes, votelogs
voting_system  ← original database (untouched)
```
4. Click any collection name to browse all documents inside it.

**Using MongoDB Shell (command line):**
```bash
mongosh
show dbs
use db_auth
show collections
db.users.find()
```

---

### 2️⃣ Which Backend Connects to Which Database?

Each backend service connects **only to its own database** using a MongoDB connection string defined in its `.env` file.

#### Connection Map:

| Backend Service | Connects To | Connection String (in .env) |
|---|---|---|
| `auth-service` | `db_auth` | `MONGO_URI=mongodb://127.0.0.1:27017/db_auth` |
| `election-service` | `db_election` | `MONGO_URI=mongodb://127.0.0.1:27017/db_election` |
| `voting-service` | `db_voting` | `MONGO_URI=mongodb://127.0.0.1:27017/db_voting` |
| `backend` (original) | `voting_system` | `MONGO_URI=mongodb://127.0.0.1:27017/voting_system` |

#### Technology Used to Connect:
- **Mongoose** (MongoDB driver for Node.js) is used in every service
- Each service calls `mongoose.connect(process.env.MONGO_URI)` at startup
- The `MONGO_URI` value in each `.env` file points to a different database name

#### Simple Example (not full code):
```
auth-service/.env       →  MONGO_URI = .../db_auth
election-service/.env   →  MONGO_URI = .../db_election
voting-service/.env     →  MONGO_URI = .../db_voting
```

When `auth-service` starts, it connects **only** to `db_auth`.
It cannot read or write to `db_election` or `db_voting`.
This is called **data isolation**.

#### Why is this separation important?

| Reason | Explanation |
|---|---|
| **Security** | User passwords are only in `db_auth`. The voting service cannot access them. |
| **Performance** | High-traffic vote writes go to `db_voting` without slowing down user login in `db_auth`. |
| **Independence** | Each service can be updated, restarted, or scaled without affecting others. |
| **Fault isolation** | If `db_election` has a problem, voting and login still work normally. |

> **Simple example:** Your bank keeps your account balance in one system and your transaction history in another. If the transaction system is slow, you can still check your balance. Same idea here.

---

### 3️⃣ Why is the Old Backend (`backend/`) and Old Database (`voting_system`) Still There?

#### Short Answer:
The old backend and database were **kept intentionally** and were **never deleted or modified**. This is the correct and safe approach when upgrading a real system.

#### Detailed Explanation:

**Why they were NOT removed:**

| Reason | Explanation |
|---|---|
| **Data safety** | `voting_system` contains all real existing data — voters, parties, elections, votes. Deleting it would permanently lose this data. |
| **Feature safety** | The original `backend/` contains working logic for all features. Removing it before the new services are fully tested would break the system. |
| **Project constraints** | The project requirement strictly states: "Do NOT remove or change any existing functionality." |
| **Fallback option** | If any new service has a problem, the original backend can still be used as a backup. |

**Does keeping the old backend violate distributed system principles?**

**No.** In real-world distributed systems, the old system is always kept running during the transition period. This is called the **Strangler Fig Pattern** — a well-known industry approach where:

1. You build new services around the old system
2. You gradually move traffic to the new services
3. The old system stays running until the new one is fully stable
4. Only then (optionally) is the old system retired

**Real-world example:**
> Netflix did not shut down their old monolithic system overnight. They slowly moved features to microservices over several years while keeping the old system running. This is exactly what this project demonstrates.

#### Summary:

```
voting_system database  →  still exists, contains original data ✅
backend/ folder         →  still exists, still works ✅
New distributed services →  added on top, use separate databases ✅
No data was lost        →  migration script copied everything ✅
No features were broken →  all original features still work ✅
```

Keeping the old system running alongside the new distributed services is **not a mistake** — it is the **correct, professional, and safe** way to upgrade a real system.

---

## 📁 Project Structure

```
Online Voting System/
├── frontend/               ← React app (unchanged)
├── backend/                ← Original monolithic backend (still works)
├── auth-service/           ← Distributed: Auth Service (port 5001)
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   └── .env
├── election-service/       ← Distributed: Election Service (port 5002)
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   └── .env
├── voting-service/         ← Distributed: Voting Service (port 5003)
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── .env
├── gateway/                ← API Gateway (port 5000)
│   ├── server.js
│   └── .env
├── migrate.js              ← One-time data migration script
└── start-all.bat           ← Starts all 4 services at once
```

---

## 🚀 How to Run the Distributed System

### Step 1 — Start all 4 backend services
Double-click `start-all.bat` OR run each manually:

```bash
# Terminal 1
cd auth-service
npm start

# Terminal 2
cd election-service
npm start

# Terminal 3
cd voting-service
npm start

# Terminal 4
cd gateway
npm start
```

### Step 2 — Start the frontend
```bash
cd frontend
npm start
```

### Step 3 — Open the app
```
http://localhost:3000
```

---

## 🔄 Data Migration (Run Once)

If you need to copy existing data from `voting_system` into the distributed databases:

```bash
node migrate.js
```

This safely copies all data without deleting or modifying the original database.

---

## ⚙️ Environment Variables

Each service has its own `.env` file:

| Service | Port | Database |
|---|---|---|
| `auth-service/.env` | 5001 | `db_auth` |
| `election-service/.env` | 5002 | `db_election` |
| `voting-service/.env` | 5003 | `db_voting` |
| `gateway/.env` | 5000 | — |
| `frontend/.env` | 3000 | — |

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Axios, React Router
- **Backend:** Node.js, Express.js (4 separate services)
- **Database:** MongoDB (4 separate databases)
- **Auth:** JWT, bcrypt
- **Gateway:** http-proxy-middleware
- **Service Communication:** HTTP (Axios)
